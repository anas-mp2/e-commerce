document.addEventListener('DOMContentLoaded',()=>{
    const cancelButtons=document.querySelectorAll('.cancel-btn');
    cancelButtons.forEach(button=>{
        button.addEventListener('click',async ()=>{
            const orderId= button.getAttribute('data-order-id');
            if(confirm('Are you sure you want to cancel this order?')){
                try{
                    const response=await fetch('/order/cancel/${orderId}',{
                        method:'POST',
                        headers:{'Content-Type': 'application/json'}
                    });
                    const data=await response.json();
                    if(data.success){
                        alert('Order cancelled successfully');
                        location.reload();
                    }else{
                        alert(data.message || 'Failed to cancel order');
                    }
                }catch(error){
                    console.error('Error cancelling order:', error);
                    alert('An error occurred');
                }
            }
        });
    });
});