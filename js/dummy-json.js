$(document).ready(function() {
    $.getJSON('https://dummyjson.com/products', function(data) {
        console.log(data);
        allProducts = data.products;
        displayProducts(1);
    });
});