// Authentication check
function checkAuth() {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('tokenExpiration');
    
    if (!token || !expiration || new Date().getTime() > parseInt(expiration)) {
        // Token is missing or expired
        localStorage.clear();
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Add authorization header to all AJAX requests
$.ajaxSetup({
    beforeSend: function(xhr) {
        const token = localStorage.getItem('token');
        if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
    }
});

let allProducts = [];
let currentPage = 1;
let itemsPerPage = 10;

function getStockStatusClass(stock, availabilityStatus) {
    if (availabilityStatus === 'Out of Stock' || stock === 0) {
        return 'status-out-stock';
    } else if (availabilityStatus === 'Low Stock' || stock < 10) {
        return 'status-low-stock';
    }
    return 'status-in-stock';
}

// CRUD Operations
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    $.ajax({
        url: `https://dummyjson.com/products/${productId}`,
        method: 'DELETE',
        success: function(response) {
            // Remove product from local array
            allProducts = allProducts.filter(p => p.id !== productId);
            displayProducts(currentPage);
            updatePagination();
            showAlert('Product deleted successfully', 'success');
        },
        error: function() {
            showAlert('Failed to delete product', 'danger');
        }
    });
}

function editProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Populate edit modal
    $('#editProductId').val(product.id);
    $('#editTitle').val(product.title);
    $('#editDescription').val(product.description);
    $('#editPrice').val(product.price);
    $('#editStock').val(product.stock);
    
    $('#editProductModal').modal('show');
}

function updateProduct(productId, data) {
    $.ajax({
        url: `https://dummyjson.com/products/${productId}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
            // Update product in local array
            const index = allProducts.findIndex(p => p.id === productId);
            if (index !== -1) {
                allProducts[index] = { ...allProducts[index], ...response };
            }
            displayProducts(currentPage);
            $('#editProductModal').modal('hide');
            showAlert('Product updated successfully', 'success');
        },
        error: function() {
            showAlert('Failed to update product', 'danger');
        }
    });
}

function addProduct(data) {
    $.ajax({
        url: 'https://dummyjson.com/products/add',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
            allProducts.unshift(response);
            displayProducts(1);
            updatePagination();
            $('#addProductModal').modal('hide');
            showAlert('Product added successfully', 'success');
        },
        error: function() {
            showAlert('Failed to add product', 'danger');
        }
    });
}

function showAlert(message, type) {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    $('.alerts-container').append(alertHtml);
    setTimeout(() => {
        $('.alert').alert('close');
    }, 3000);
}

function displayProducts(page) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = allProducts.slice(startIndex, endIndex);
    
    let tableBody = '';
    paginatedProducts.forEach(product => {
        const discountedPrice = product.price * (1 - product.discountPercentage / 100);
        const statusClass = getStockStatusClass(product.stock, product.availabilityStatus);
        
        tableBody += `
            <tr>
                <td>
                    <img src="${product.thumbnail}" alt="${product.title}" class="product-thumbnail">
                </td>
                <td>
                    <div class="fw-bold">${product.title}</div>
                    <small class="text-muted">${product.description.substring(0, 50)}...</small>
                </td>
                <td>${product.category}</td>
                <td>${product.brand || '-'}</td>
                <td>
                    <div class="price">$${product.price.toFixed(2)}</div>
                    ${product.discountPercentage > 0 ? 
                        `<small class="text-muted text-decoration-line-through">$${discountedPrice.toFixed(2)}</small>` : 
                        ''}
                </td>
                <td>
                    ${product.discountPercentage > 0 ? 
                        `<span class="discount">-${product.discountPercentage}%</span>` : 
                        '-'}
                </td>
                <td>
                    <div class="rating">
                        ${product.rating.toFixed(1)} ★
                    </div>
                </td>
                <td>${product.stock}</td>
                <td>
                    <span class="stock-status ${statusClass}">
                        ${product.availabilityStatus || (product.stock > 0 ? 'In Stock' : 'Out of Stock')}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editProduct(${product.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteProduct(${product.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    $('#productTableBody').html(tableBody);
}

function updatePagination() {
    const totalPages = Math.ceil(allProducts.length / itemsPerPage);
    let paginationHtml = '';
    
    // Previous button
    paginationHtml += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
        </li>
    `;
    
    // Page numbers with ellipsis
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page and ellipsis
    if (startPage > 1) {
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="1">1</a>
            </li>
            ${startPage > 2 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
        `;
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
        paginationHtml += `
            ${endPage < totalPages - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            <li class="page-item">
                <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
            </li>
        `;
    }
    
    // Next button
    paginationHtml += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
        </li>
    `;
    
    $('#pagination').html(paginationHtml);

    // Update total records info
    $('.total-records').text(`Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, allProducts.length)} of ${allProducts.length} records`);
}

$(document).ready(function() {
    // Check authentication
    if (!checkAuth()) return;
    
    // Add alerts container
    $('body').prepend('<div class="alerts-container position-fixed top-0 end-0 p-3" style="z-index: 1050;"></div>');
    
    // Add user info and logout button
    const user = JSON.parse(localStorage.getItem('user'));
    $('.container').prepend(`
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                Welcome, ${user.firstName} ${user.lastName}
                <small class="text-muted">(${user.email})</small>
            </div>
            <button class="btn btn-outline-danger" onclick="logout()">Logout</button>
        </div>
    `);
    
    // Add new product button
    $('.container h1').after(`
        <button class="btn btn-primary mb-4" data-bs-toggle="modal" data-bs-target="#addProductModal">
            <i class="bi bi-plus"></i> Add New Product
        </button>
    `);
    
    // Fetch products from API with limit=100
    $.getJSON('https://dummyjson.com/products?limit=100')
        .done(function(data) {
            allProducts = data.products;
            displayProducts(currentPage);
            updatePagination();
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 401) {
                // Unauthorized - redirect to login
                window.location.href = 'login.html';
            } else {
                $('#productTableBody').html(`
                    <tr>
                        <td colspan="10" class="text-center text-danger">
                            Error loading products. Please try again later.
                        </td>
                    </tr>
                `);
                console.error('Error fetching products:', textStatus, errorThrown);
            }
        });
    
    // Handle form submissions
    $('#editProductForm').on('submit', function(e) {
        e.preventDefault();
        const productId = $('#editProductId').val();
        const data = {
            title: $('#editTitle').val(),
            description: $('#editDescription').val(),
            price: parseFloat($('#editPrice').val()),
            stock: parseInt($('#editStock').val())
        };
        updateProduct(productId, data);
    });
    
    $('#addProductForm').on('submit', function(e) {
        e.preventDefault();
        const data = {
            title: $('#addTitle').val(),
            description: $('#addDescription').val(),
            price: parseFloat($('#addPrice').val()),
            stock: parseInt($('#addStock').val()),
            category: $('#addCategory').val()
        };
        addProduct(data);
    });
    
    // Handle pagination clicks
    $(document).on('click', '.page-link', function(e) {
        e.preventDefault();
        const newPage = parseInt($(this).data('page'));
        
        if (newPage >= 1 && newPage <= Math.ceil(allProducts.length / itemsPerPage)) {
            currentPage = newPage;
            displayProducts(currentPage);
            updatePagination();
            // Scroll to top of table
            $('html, body').animate({
                scrollTop: $('.table').offset().top - 20
            }, 200);
        }
    });
    
    // Handle items per page change
    $('#itemsPerPage').change(function() {
        itemsPerPage = parseInt($(this).val());
        currentPage = 1; // Reset to first page
        displayProducts(currentPage);
        updatePagination();
    });
});

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
} 