paypal.Buttons({
    createOrder: function (data, actions) {
        return fetch("/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                items: [
                    { id: 1, quantity: 2 },
                    { id: 2, quantity: 3 },
                ]
            })
        })
        .then(res => {
            if (res.ok) return res.json();
            return res.json().then(json => Promise.reject(json));
        })
        .then(({ orderID }) => {
            return orderID;
        })
        .catch(error => {
            console.error(error);
        });
    },
    onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
            alert("Transaction completed by " + details.payer.name.given_name);
        });
    },
})
.render("#paypal");