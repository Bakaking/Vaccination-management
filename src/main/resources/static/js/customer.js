function customerUpdatePressed () {
	customerUpdateBtn = true;
}

function customerUpdateNotPressed() {
	customerUpdateBtn = false;
}

function fetchCustomer(filename) {
    $.ajax({
        url: "/api/customer/getAjax",
        data: { filename: filename },
        dataType: "text",
        success: function(data) {
            $("#ajax-content")[0].innerHTML = data;
            if (filename === "customer-list.html") {
                $("#ajax-title").html("INJECTION CUSTOMER LIST");
                listCustomers(0);
            } else {
                $("#ajax-title").html("REGISTER CUSTOMER INFORMATION");
                randomizeCaptcha();
            }
        },
        error: function(jqxhr, textStatus, errorThrown) {
            console.error("AJAX error:", textStatus, errorThrown);
        }
    });
}

function listCustomers(currentPage) {
	const query = $("#searchInput")[0].value;
    const currentPageSize = parseInt($("#dropdownMenuButton").html(), 10);
	$.ajax({
		url: "/api/customer/findAllCustomers",
		data: {
			searchInput: query,
			page: currentPage,
			size: currentPageSize
		},
		method: "GET",
		dataType: "json",
		success: function(customers) {
                $("#customer-list-content").html("");
                customers.content.forEach(customer => {
                    const row = `
                        <tr>
                            <td class="customer-id-hidden">${customer.customerId}</td>
                            <td class="text-center check-boxes"><input type="checkbox"></td>
                            <td><a href="#" class="link-offset-2 link-underline link-underline-opacity-0"
                                onclick="showCustomerDetails('${customer.customerId}')">
                                    ${customer.fullName}
                                </a>
                            </td>
                            <td>${customer.dateOfBirth}</td>
                            <td>${customer.gender}</td>
                            <td>${customer.address}</td>
                            <td>${customer.identityCard}</td>
                            <td>${customer.phone}</td>
                        </tr>
                    `;
                    $("#customer-list-content").append(row);
                });
                updatePageCustomer(customers.number, customers.totalPages, currentPageSize, customers.totalElements);
		},
		error: function(jqXHR, errorThrown) {
            console.error('Error fetching customer data:', jqXHR.statusText, errorThrown);
          }
	});
}

function updatePageCustomer(currentPage, totalPages, pageSize, totalElements) {
	if (totalElements === 0) {
		$("#start-entry")[0].innerHTML = 0;
		$("#end-entry")[0].innerHTML = 0;
		$("#total-entries")[0].innerHTML = 0;
	} else {
        $("#start-entry")[0].innerHTML = currentPage === 0 ? 1 : currentPage * pageSize + 1;
        $("#end-entry")[0].innerHTML = currentPage === totalPages - 1 ? totalElements : (currentPage + 1) * pageSize;
        $("#total-entries")[0].innerHTML = totalElements;
	}

    const paginationContainer = $("#page-buttons")[0];
    let pageButtons = '';

    // Left button
    if (currentPage > 0) {
        pageButtons += `<li class="page-item"><a class="page-link" onclick="listCustomers(${currentPage - 1}, ${pageSize})">&laquo;</a></li>`;
    } else {
        pageButtons += `<li class="page-item disabled"><span class="page-link">&laquo;</span></li>`;
    }

    // Show all pages if totalPages < 10
    if (totalPages <= 10) {
        for (let i = 0; i < totalPages; i++) {
            pageButtons += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" onclick="listCustomers(${i}, ${pageSize})">${i + 1}</a></li>`;
        }
    } else {
        // Always show page 1 and 2
        if (totalPages > 1) {
            pageButtons += `<li class="page-item ${currentPage === 0 ? 'active' : ''}"><a class="page-link" onclick="listCustomers(0, ${pageSize})">1</a></li>`;
            if (totalPages > 2) {
                pageButtons += `<li class="page-item ${currentPage === 1 ? 'active' : ''}"><a class="page-link" onclick="listCustomers(1, ${pageSize})">2</a></li>`;
            }
        }

        // Show page numbers around the current page with ellipses
        if (currentPage > 2) {
            pageButtons += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 3, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            pageButtons += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" onclick="listCustomers(${i}, ${pageSize})">${i + 1}</a></li>`;
        }

        if (currentPage < totalPages - 4) {
            pageButtons += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        // Always show the last two pages
        if (totalPages > 2) {
            if (totalPages > 3) {
                pageButtons += `<li class="page-item ${currentPage === totalPages - 2 ? 'active' : ''}"><a class="page-link" onclick="listCustomers(${totalPages - 2}, ${pageSize})">${totalPages - 1}</a></li>`;
            }
            pageButtons += `<li class="page-item ${currentPage === totalPages - 1 ? 'active' : ''}"><a class="page-link" onclick="listCustomers(${totalPages - 1}, ${pageSize})">${totalPages}</a></li>`;
        }
    }

    // Right button
    if (currentPage < totalPages - 1) {
        pageButtons += `<li class="page-item"><a class="page-link" onclick="listCustomers(${currentPage + 1}, ${pageSize})">&raquo;</a></li>`;
    } else {
        pageButtons += `<li class="page-item disabled"><span class="page-link">&raquo;</span></li>`;
    }

    paginationContainer.innerHTML = `<ul class="pagination">${pageButtons}</ul>`;
    $("#dropdownMenuButton")[0].innerHTML = pageSize;
}

function deleteSelectedCustomer() {
    const checkboxes = $("#customer-list-content input[type='checkbox']:checked");
    if (checkboxes.length === 0) {
        alert("Please select at least one customer to delete");
        return;
    }
    let customerIdList = {
        customerIds: Array.from(checkboxes).map(checkbox => {
            return checkbox.closest('tr').querySelector('td:nth-child(1)').textContent.trim();
        })
    };
    const confirmed = confirm("Are you sure you want to delete the selected customers?");
    if (!confirmed) {
        return;
    }
    $.ajax({
        url: "/api/customer/delete",
        method: "DELETE",
        contentType: "application/json",
        data: JSON.stringify(customerIdList),
        success: function(stringData) {
            alert(stringData);
            listCustomers(0);
        },
        error: function(xhr) {
            if(xhr.status === 400) {
                const error = JSON.parse(xhr.responseText);
                let validationMessage = "";
                let i = 0;
                error.errors.forEach(error => {
                    validationMessage += ++i + "." + error.defaultMessage + "\n";
                });
                alert(error.message + " -->\n" + validationMessage);
            } else if(xhr.status === 500) {
            	console.error("cannot delete customer: due to internal server error!");
            } else {
                console.error("an expected error occurred at deleting customer\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
            }
        }
    });
}

function randomizeCaptcha() {
    const captchaCode = Math.floor(10000 + Math.random() * 90000);
    $("#customerCaptchaCode").val(captchaCode);
}

function randomizeCaptchaWithReset() {
	if(customerUpdateBtn === true) {
		const customerId = $("#customerId")[0].value;
		$("#add-customer-form")[0].reset();
		$("#customerId")[0].value = customerId;
	}
	else {
		$("#add-customer-form")[0].reset();
	}
	randomizeCaptcha();
}

function checkPassword() {
	if(customerUpdateBtn === true) {
		return 1;
	}
	if($("#customerPassword").val() != $("#customerPasswordConfirm").val()) {
		alert("password and password confirm do not match!");
		return 0;
	}
	else {
		return 1;
	}
}

function checkCaptcha() {
	if(checkPassword() === 0) {
		return;
	}
	if($("#customerCaptcha").val() === $("#customerCaptchaCode").val()) {
		addCustomer();
	} else {
		alert("Captcha does not match!, please try again");
	}
}

function addCustomer() {
	const genderInput = $('input[name="gender"]:checked');
    const genderValue = genderInput.length ? genderInput.val() : null;
    const customer = {
            customerId: $('#customerId').val(),
            fullName: $('#customerFullName').val(),
            gender: genderValue,
            dateOfBirth: $('#customerDateOfBirth').val(),
            phone: $('#customerPhone').val(),
            address: $('#customerAddress').val(),
            email: $('#customerEmail').val(),
            identityCard: $("#customerIdentityCard").val(),
            username: $('#customerUsername').val(),
            password: $('#customerPassword').val(),
        };
        if(customerUpdateBtn === true) {
        	if(customer.password === "") {
        		customer.password = "null-password-null";
        	}
        }
    $.ajax({
    	url: "/api/customer/add",
    	method: "POST",
    	contentType: "application/json",
    	data: JSON.stringify(customer),
    	success: function(stringData) {
    		alert(stringData);
    		if (customerUpdateBtn === true) {
                customerUpdateBtn = false;
                fetchCustomer("customer-list.html");
    		} else {
    			randomizeCaptchaWithReset();
    		}
    	},
        error: function(xhr) {
            if(xhr.status === 400) {
                const error = JSON.parse(xhr.responseText);
                let validationMessage = "";
                let i = 0;
                error.errors.forEach(error => {
                    validationMessage += ++i + "." + error.defaultMessage + "\n";
                });
                alert(error.message + " -->\n" + validationMessage);
            }
            else {
                console.error("an expected error occurred at create/update customer\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
            }
        }
    });
}

function updateSelectedCustomer() {
	const checkbox = $(".check-boxes input[type='checkbox']:checked");
	if (checkbox.length != 1) {
		alert("please select only 1 customer to update information!");
		return;
	}
	const customerId = checkbox[0].closest('tr').querySelector('td:nth-child(1)').textContent;
	fetchCustomer("customer-create.html");
	$.ajax({
        url: "/api/customer/findById",
        data: {customerId: customerId},
        success: function(customer) {
            $("#customerFullName")[0].value = customer.fullName;
            $("#customerDateOfBirth")[0].value = customer.dateOfBirth;
            if (customer.gender === "MALE") {
                $('#gender-male')[0].checked = true;
            } else {
            	$('#gender-female')[0].checked = true;
            }
            $("#customerIdentityCard")[0].value = customer.identityCard;
            $("#customerAddress")[0].value = customer.address;
            $("#customerId")[0].value = customer.customerId;
            $("#customerId")[0].disabled = true;
            $("#customerUsername")[0].value = customer.username;
//          $("#customerPassword")[0].value = customer.password;
			$("#customerPassword")[0].required = false;
			$("#customerPasswordConfirm")[0].required = false;
			$("#password-div")[0].hidden = true;
			$("#passwordConfirm-div")[0].hidden = true;
            $("#customerEmail")[0].value = customer.email;
            $("#customerPhone")[0].value = customer.phone;
        },
        error: function(xhr) {
        	console.error("error at finding customer to be updated\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
        }
    });
}

function showCustomerDetails(id) {
	$.ajax({
		url: "/api/customer/findById",
		data: {customerId: id},
		success: function(customer) {
			$("#modalCustomerId")[0].value = customer.customerId;
			$("#modalCustomerFullName")[0].value = customer.fullName;
			$("#modalCustomerDob")[0].value = customer.dateOfBirth;
			$("#modalCustomerGender")[0].value = customer.gender;
			$("#modalCustomerIdentityCard")[0].value = customer.identityCard;
			$("#modalCustomerAddress")[0].value = customer.address;
			$("#modalCustomerEmail")[0].value = customer.email;
			$("#modalCustomerPhone")[0].value = customer.phone;
			// Show the modal
            var modal = new bootstrap.Modal(document.getElementById('customerModal'));
            modal.show();
		},
		error: function(xhr) {
			console.error("error at finding customer for modal display\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
		}
	});
}