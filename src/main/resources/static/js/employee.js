function pressEmployeeUpdateButton() {
	employeeUpdateBtn = true;

}
function unPressEmployeeUpdateButton() {
	employeeUpdateBtn = false;
	employeeCancelBtn = false;
}

function pressCancel() {
	employeeCancelBtn = true;
}

//---------------------------
function fetchEmployee(filename) {
    const checkbox = $(".check-boxes input[type='checkbox']:checked");
    if (employeeUpdateBtn === true && employeeCancelBtn === false) {
        if (checkbox.length != 1) {
            alert("Please select only 1 employee to update!");
            return;
        }
    }

    const minLoadingTime = 100; // Minimum time to show loading (2 seconds)
    const startTime = new Date().getTime(); // Track the start time of the request

    // Ensure the loading overlay and content height fits correctly
    $('#loading-overlay').css({
        display: 'flex', // Ensure it's visible and centered with flexbox
        height: $("#ajax-content").outerHeight(), // Match the height of #ajax-content
        top: $("#ajax-content").offset().top, // Adjust position relative to #ajax-content
        left: $("#ajax-content").offset().left,
        width: $("#ajax-content").outerWidth()
    });

    $.ajax({
        url: "/api/employee/getAjax",
        data: { filename: filename },
        beforeSend: function() {
            // Show the loading overlay only over #ajax-content
            $("#loading-overlay").show();
        },
        success: function(data) {
            $("#ajax-content")[0].innerHTML = data;

            if (filename === "employee-list.html") {
                $("#ajax-title")[0].innerHTML = "EMPLOYEE LIST";
                findAllEmployee(0);
            } else {
                if (employeeUpdateBtn === true) {
                    const employeeId = checkbox[0].closest('tr').querySelector('td:nth-child(2)').textContent;
                    arrangeUpdateEmployeeInfoToInput(employeeId);
                }
                $("#image")[0].setAttribute('required', '');
                $("#ajax-title")[0].innerHTML = "CREATE EMPLOYEE";
            }
        },
        error: function(xhr) {
            console.error("Error fetching employee ajax document!\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
        },
        complete: function() {
            const endTime = new Date().getTime(); // Track the end time
            const timeElapsed = endTime - startTime; // Calculate time taken for the AJAX request

            const remainingTime = minLoadingTime - timeElapsed; // Calculate remaining time to reach 2 seconds
            const delay = Math.max(remainingTime, 0); // Ensure non-negative delay

            // Hide the loading overlay after the remaining time
            setTimeout(function() {
                $("#loading-overlay").hide();
            }, delay);
        }
    });
}

function findAllEmployee(page) {
    const query = $("#searchInput")[0].value;
   	const pageSize = parseInt($("#dropdownMenuButton").text().trim(), 10);
    $.ajax({
    	url: "/api/employee/findAll",
    	data: {
    		searchInput: query,
    		page: page,
    		size: pageSize
    	},
    	success: function(employees) {
    		const tableBody = $("#employee-list-content")[0];
            tableBody.innerHTML = "";
            employees.content.forEach(employee => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="text-center check-boxes"><input type="checkbox" class="check-select-box"></td>
                    <td class="text-center"><a class="link-offset-2 link-underline link-underline-opacity-0" onclick="showEmployeeDetails('${employee.employeeId}')">${employee.employeeId}</a></td>
                    <td class="text-capitalize text-start text-center">${employee.employeeName}</td>
                    <td class="text-start text-center">${employee.dateOfBirth}</td>
                    <td class="text-start text-center">${employee.gender}</td>
                    <td class="text-start text-center">${employee.phone}</td>
                    <td class="text-capitalize text-start text-center">${employee.address}</td>
                    <td class="text-center"><img src="/api/employee/image/${employee.employeeId}" alt="image" style="height: 60px; width: 45px"></td>
                `;
                tableBody.appendChild(row);
            });
            updatePageEmployee(employees.number, employees.totalPages, pageSize, employees.totalElements);
    	},
    	error: function(xhr) {
    		console.error("error at finding employee list: \nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
    	}
    });
}

//--update
function updateSelectedEmployee() {
    const checkbox = document.querySelectorAll('#employee-list-content input[type="checkbox"]:checked')
    if (checkbox.length !== 1) {
        alert("Please select only one employee");
        return;
    }
    const employeeId = checkbox[0].closest('tr').querySelector('td:nth-child(2)').textContent;
    console.log(employeeId);
    // Fetch employee data using selectedEmployeeId
    fetchUpdateEmployee('employee-create.html', employeeId);
}

function arrangeUpdateEmployeeInfoToInput(employeeId) {
	$.ajax({
        url: "/api/employee/findById",
        data: {employeeId: employeeId},
        success: function(employee) {
	        $("#image")[0].removeAttribute('required');
			$("#employeeId")[0].value = employee.employeeId;
			$("#employeeId")[0].disabled = true;
			$("#employeeName")[0].value = employee.employeeName;
			if(employee.gender === "MALE") {
				$("#gender-male")[0].checked = true;
			} else {
				$("#gender-female")[0].checked = true;
			}
			$("#dateOfBirth")[0].value = employee.dateOfBirth;
			$("#phone")[0].value = employee.phone;
			$("#address")[0].value = employee.address;
			$("#email")[0].value = employee.email;
			$("#workingPlace")[0].value = employee.workingPlace;
			$("#position")[0].value = employee.position;
			$("#username")[0].value = employee.username;
			$("#username")[0].disabled = true;
			$("#username-div")[0].hidden = true;
//			$("#password")[0].value = employee.password;
//			$("#password")[0].disabled = true;
			$("#password")[0].required = false;
			$("#password-div")[0].hidden = true;
			$("#toggle-button")[0].hidden = true;
			if (employee.image || employee.image != null) {
                $("#image-preview")[0].src = "/api/employee/image/" +employee.employeeId;
                $("#image-preview")[0].style.display = 'block';
            } else {
                $("#image-preview")[0].style.display = 'none';
            }
        },
        error: function(error) {
            console.error("error: no data for employee to be updated: \nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
        }
    });
}

function deleteSelectedEmployee() {
    const checkboxes = $("#employee-list-content input[type='checkbox']:checked");
    if (checkboxes.length === 0) {
        alert("Please select at least one employee to delete");
        return;
    }

    const employeeIds = Array.from(checkboxes).map(checkbox => {
        return checkbox.closest('tr').querySelector('td:nth-child(2)').textContent.trim();
    });

    const confirmed = confirm("Are you sure you want to delete the selected employees?");
    if (!confirmed) {
        return;
    }

	$.ajax({
		url: "/api/employee/delete",
		method: "DELETE",
		contentType: "application/json",
		data: JSON.stringify(employeeIds),
		success: function(stringData) {
            alert(stringData);
            findAllEmployee(0,10);
		},
		error: function(xhr) {
			console.error("error deleting\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
		}
	});
}

//------show employee details on modal
function showEmployeeDetails(id) {
	$.ajax({
		url: "/api/employee/findById",
		data: {employeeId: id},
		success: function(employee) {
			$("#modalEmployeeId")[0].value = employee.employeeId;
			$("#modalEmployeeName")[0].value = employee.employeeName;
			$("#modalEmployeeDob")[0].value = employee.dateOfBirth;
			$("#modalEmployeeGender")[0].value = employee.gender;
			$("#modalEmployeePhone")[0].value = employee.phone;
			$("#modalEmployeeAddress")[0].value = employee.address;
			$("#modalEmployeeEmail")[0].value = employee.email;
			$("#modalEmployeePosition")[0].value = employee.position;
			$("#modalWorkingPlace")[0].value = employee.workingPlace;
			$("#modalEmployeeImage")[0].src = "/api/employee/image/" + employee.employeeId;
			// Show the modal
            var modal = new bootstrap.Modal(document.getElementById('employeeModal'));
            modal.show();
		},
		error: function(xhr) {
			console.error("error at getting employee detail for modal\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
		}
	});
}

function updatePageEmployee(currentPage, totalPages, pageSize, totalElements) {
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
        pageButtons += `<li class="page-item"><a class="page-link" onclick="findAllEmployee(${currentPage - 1}, ${pageSize})">&laquo;</a></li>`;
    } else {
        pageButtons += `<li class="page-item disabled"><span class="page-link">&laquo;</span></li>`;
    }

    // Show all pages if totalPages < 10
    if (totalPages <= 10) {
        for (let i = 0; i < totalPages; i++) {
            pageButtons += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" onclick="findAllEmployee(${i}, ${pageSize})">${i + 1}</a></li>`;
        }
    } else {
        // Always show page 1 and 2
        if (totalPages > 1) {
            pageButtons += `<li class="page-item ${currentPage === 0 ? 'active' : ''}"><a class="page-link" onclick="findAllEmployee(0, ${pageSize})">1</a></li>`;
            if (totalPages > 2) {
                pageButtons += `<li class="page-item ${currentPage === 1 ? 'active' : ''}"><a class="page-link" onclick="findAllEmployee(1, ${pageSize})">2</a></li>`;
            }
        }

        // Show page numbers around the current page with ellipses
        if (currentPage > 2) {
            pageButtons += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 3, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            pageButtons += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" onclick="findAllEmployee(${i}, ${pageSize})">${i + 1}</a></li>`;
        }

        if (currentPage < totalPages - 4) {
            pageButtons += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        // Always show the last two pages
        if (totalPages > 2) {
            if (totalPages > 3) {
                pageButtons += `<li class="page-item ${currentPage === totalPages - 2 ? 'active' : ''}"><a class="page-link" onclick="findAllEmployee(${totalPages - 2}, ${pageSize})">${totalPages - 1}</a></li>`;
            }
            pageButtons += `<li class="page-item ${currentPage === totalPages - 1 ? 'active' : ''}"><a class="page-link" onclick="findAllEmployee(${totalPages - 1}, ${pageSize})">${totalPages}</a></li>`;
        }
    }

    // Right button
    if (currentPage < totalPages - 1) {
        pageButtons += `<li class="page-item"><a class="page-link" onclick="findAllEmployee(${currentPage + 1}, ${pageSize})">&raquo;</a></li>`;
    } else {
        pageButtons += `<li class="page-item disabled"><span class="page-link">&raquo;</span></li>`;
    }

    paginationContainer.innerHTML = `<ul class="pagination">${pageButtons}</ul>`;
    $("#dropdownMenuButton")[0].innerHTML = pageSize;
}

//------------------
//preview image
function previewImage() {
    const imagePreview = $("#image-preview")[0];
    const fileInput = $("#image")[0];
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
    }
}

// add employee
function addEmployee() {
	if ($("#phone")[0].value.replace(/[^\d]/g , "").length !== 10) {
		alert("phone number must be 10 digits");
		return;
	}
	const date = new Date($("#dateOfBirth")[0].value);
	const today = new Date();
	let age = today.getFullYear() - date.getFullYear();
	const monthDiff = today.getMonth() - date.getMonth();
	const dayDiff = today.getDate() - date.getDate();
	if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
		age--;
	}
	if (age < 18) {
		alert("the age is not valid, please check date of birth!");
		return;
	}
    const genderInput = $("input[name='gender']:checked")[0];
    const genderValue = genderInput ? genderInput.value : null;
    const employee = {
        employeeId: $("#employeeId")[0].value,
        employeeName: $("#employeeName")[0].value,
        gender: genderValue,
        dateOfBirth: $("#dateOfBirth")[0].value,
        phone: $("#phone")[0].value,
        address: $("#address")[0].value,
        email: $("#email")[0].value,
        workingPlace: $("#workingPlace")[0].value,
        position: $("#position")[0].value,
        username: $("#username")[0].value,
        password: $("#password")[0].value,
        isFromUpdate: employeeUpdateBtn === true ? true : false,
        image: null
    };
    const imageFile = $("#image")[0].files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = function () {
            employee.image = reader.result.split(',')[1];
            sendEmployeeData(employee);
        };
        reader.readAsDataURL(imageFile);
    } else {
    	employee.image = "null-image";
        sendEmployeeData(employee);
    }
}

function sendEmployeeData(employee) {
	if(employeeUpdateBtn === true) {
		if(employee.password === "") {
            employee.password = "null-password";
        }
	}
	$.ajax({
		url: "/api/employee/add",
		method: "POST",
		contentType: "application/json",
		data: JSON.stringify(employee),
		// success: 200 -> 399
		success: function(stringData) {
            alert(stringData);
            if (employeeUpdateBtn === true) {
            	employeeUpdateBtn = false;
            	fetchEmployee("employee-list.html");
            } else {
                $("#add-employee-form")[0].reset();
                $("#image-preview")[0].style.display = 'none';
            }
		},
		// error: 400 and up
		error: function(xhr) {
            if(xhr.status === 400) {
                try {
                    const error = JSON.parse(xhr.responseText);
                    let validationMessage = "";
                    let i = 0;
                    error.errors.forEach(error => {
                        validationMessage += ++i + "." + error.defaultMessage + "\n";
                    });
                    alert(error.message + " -->\n" + validationMessage);
                } catch(error) {
					 console.error("an unexpected error occurred at create/update employee\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
                }
            }
            else {
                console.error("an unexpected error occurred at create/update employee\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
            }
		}
	});
}

// show/hide password when input data
function togglePassword() {
    const passwordField = $("#password")[0];
    const toggleIcon = $("#toggle-icon")[0];
    if (passwordField.type === "password") {
        passwordField.type = "text";
        toggleIcon.src = "/images/icons/hidden.png";
    } else {
        passwordField.type = "password";
        toggleIcon.src = "/images/icons/eye.png";
    }
}

// button reset: reset and hide preview image, can't reset id, username, password
function resetEmployeeInput() {
    $("#image-preview")[0].style.display = 'none';
    $("#image-preview")[0].src = '/images/icons/image.png';
	if(employeeUpdateBtn === true) {
        const employeeId = $("#employeeId")[0].value;
        const username = $("#username")[0].value;
        const password = $("#password")[0].value;
    	$("#add-employee-form")[0].reset();
        $("#employeeId")[0].value = employeeId;
        $("#username")[0].value = username;
        $("#password")[0].value = password;
	} else {
		$("#add-employee-form")[0].reset();
	}
}
