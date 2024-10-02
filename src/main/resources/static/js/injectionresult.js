function pressIrUpdateButton(){
	injectionResultUpdateBtn = true;
}
function unPressIrUpdateButton(){
	injectionResultUpdateBtn = false;
}

function fetchInjectionResult(filename) {
$.ajax({
    url: "/api/injection-result/getAjax",
    data: {filename: filename},
    success: function(ajaxData) {
        $('#ajax-content')[0].innerHTML = ajaxData;
         if(filename === "injection-result-list.html") {
             $("#ajax-title")[0].innerHTML = "INJECTION RESULT LIST";
             findAllInjectionResults(0, 10);
         }
         else {
            $("#ajax-title")[0].innerHTML = "CREATE INJECTION RESULT";
            if(injectionResultTempId !== undefined) {
            console.log("checkpoint 1");
            	updateInjectionResultDetail(injectionResultTempId);
            } else {
                setupDropdown();
                loadInjectionPlace();
            }
         }
    },
    error: function(xhr) {
        console.error("error at getting ajax document for result\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
    }
});
}

function setupDropdown(customerName, vaccineTypeName) {
	console.log("checkpoint 4: injectionResultTempId = " + injectionResultTempId);
	$.ajax({
		url: "/api/injection-result/displayDropdown",
		success:function (data) {
			vaccineTypeDisplayObject = data.vaccineTypes;
			if(injectionResultTempId !== undefined) {
				console.log("checkpoint 3");
				$("#customer")[0].innerHTML = '';
                $("#vaccineTypeName")[0].innerHTML = '';
                $("#vaccineName")[0].innerHTML = '';
                data.customers.forEach(customer => {
                    if(customer.fullName === customerName) {
                        $("#customer")[0].innerHTML += `<option value="${customer.customerId}" selected>${customer.customerId}-${customer.fullName}-${customer.dateOfBirth}</option>`;
                    } else {
                        $("#customer")[0].innerHTML += `<option value="${customer.customerId}">${customer.customerId}-${customer.fullName}-${customer.dateOfBirth}</option>`;
                    }
                });
                data.vaccineTypes.forEach(vaccineType => {
                	if(vaccineType.vaccineTypeName === vaccineTypeName) {
                        $("#vaccineTypeName")[0].innerHTML += `<option value="${vaccineType.vaccineTypeId}" selected>--${vaccineType.vaccineTypeName}--</option>`;
                    } else {
                        $("#vaccineTypeName")[0].innerHTML += `<option value="${vaccineType.vaccineTypeId}">--${vaccineType.vaccineTypeName}--</option>`;
                    }
                });
                injectionResultTempId = undefined;
                dropdownVaccineName();
			} else {
                $("#customer")[0].innerHTML = '<option value="" disabled selected>--Select Customer--</option>';
                $("#vaccineTypeName")[0].innerHTML = '<option value="" disabled selected>--Select Vaccine Type Name--</option>';
                $("#vaccineName")[0].innerHTML = '<option value="" disabled selected>--Select Vaccine Type--</option>';
                data.customers.forEach(customer => {
                    const row = `<option value="${customer.customerId}">${customer.customerId}-${customer.fullName}-${customer.dateOfBirth}</option>`;
                    $("#customer").append(row);
                });
                data.vaccineTypes.forEach(vaccineType => {
                    const row = `<option value="${vaccineType.vaccineTypeId}">--${vaccineType.vaccineTypeName}--</option>`;
                    $("#vaccineTypeName").append(row);
                });
			}
		},
		error: function(xhr) {
			console.error("error at displaying dropdown list\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
		}
	});
}

function dropdownVaccineName() {
	if(vaccineNameForDropdown !== undefined) {
		$("#vaccineName")[0].innerHTML = '';
		const vaccineTypeValue = $("#vaccineTypeName")[0].value;
        vaccineTypeDisplayObject.forEach(vaccineType => {
            if (vaccineType.vaccineTypeId === vaccineTypeValue) {
                vaccineType.vaccines.forEach(vaccine => {
                    if(vaccine.vaccineName === vaccineNameForDropdown) {
                        $("#vaccineName")[0].innerHTML += `<option value ="${vaccine.vaccineId}" selected>--${vaccine.vaccineName}--</option>`;
                    } else {
                        $("#vaccineName")[0].innerHTML += `<option value ="${vaccine.vaccineId}">--${vaccine.vaccineName}--</option>`;
                    }
                });
            }
        });
        vaccineNameForDropdown = undefined;
	} else {
        $("#vaccineName")[0].innerHTML = '<option value="" disabled selected>--Select Vaccine Type--</option>';
        const vaccineTypeValue = $("#vaccineTypeName")[0].value;
        vaccineTypeDisplayObject.forEach(vaccineType => {
            if (vaccineType.vaccineTypeId === vaccineTypeValue) {
                vaccineType.vaccines.forEach(vaccine => {
                    const row = `<option value ="${vaccine.vaccineId}">--${vaccine.vaccineName}--</option>`;
                    $("#vaccineName").append(row);
                });
            }
        });
	}
}

function findAllInjectionResults(page) {
    const searchInputElement = document.getElementById('searchInput');
    const query = searchInputElement ? searchInputElement.value : '';
    const pageSize = parseInt($("#dropdownMenuButton")[0].innerHTML, 10);
	$.ajax({
		url: "/api/injection-result/findBySearch",
		data: {
			searchInput: query,
			page: page,
			size: pageSize
		},
		success: function(injectionResults) {
			const tableBody = document.getElementById('injection-result-list-content');
            tableBody.innerHTML = '';
            injectionResults.content.forEach(result => {
                const row = document.createElement('tr');
                row.innerHTML = `
                        <td class="text-center check-boxes"><input type="checkbox"></td>
                        <td hidden>${result.injectionResultId}</td>
                        <td class="text-start"><a class="link-offset-2 link-underline link-underline-opacity-0" onclick="showInjectionResultDetails('${result.injectionResultId}')">${result.customer.fullName}</a></td>
                        <td class="text-start">${result.vaccineFromInjectionResult.vaccineName}</td>
                        <td class="text-start">${result.vaccineFromInjectionResult.vaccineType.vaccineTypeName}</td>
                        <td>${result.numberOfInjection}</td>
                        <td>${result.injectionDate}</td>
                        <td>${result.nextInjectionDate}</td>
                    `;
                tableBody.appendChild(row);
            });
            updatePageInjectionResult(injectionResults.number, injectionResults.totalPages, pageSize, injectionResults.totalElements);
		},
		error: function(xhr) {
			console.error("error at finding result,\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
		}
	});
}

function updatePageInjectionResult(currentPage, totalPages, pageSize, totalElements) {
    if (totalElements === 0) {
    		$("#start-entry")[0].innerHTML = 0;
    		$("#end-entry")[0].innerHTML = 0;
    		$("#total-entries")[0].innerHTML = 0;
    	} else {
            $("#start-entry")[0].innerHTML = currentPage === 0 ? 1 : currentPage * pageSize + 1;
            $("#end-entry")[0].innerHTML = currentPage === totalPages - 1 ? totalElements : (currentPage + 1) * pageSize;
            $("#total-entries")[0].innerHTML = totalElements;
    	}

    const paginationContainer = document.getElementById("page-buttons");
    let pageButtons = '';

    // Left button
    if (currentPage > 0) {
        pageButtons += `<li class="page-item"><a class="page-link" onclick="findAllInjectionResults(${currentPage - 1}, ${pageSize})">&laquo;</a></li>`;
    } else {
        pageButtons += `<li class="page-item disabled"><span class="page-link">&laquo;</span></li>`;
    }

    // Show all pages if totalPages < 10
    if (totalPages <= 10) {
        for (let i = 0; i < totalPages; i++) {
            pageButtons += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionResults(${i}, ${pageSize})">${i + 1}</a></li>`;
        }
    } else {
        // Always show page 1 and 2
        if (totalPages > 1) {
            pageButtons += `<li class="page-item ${currentPage === 0 ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionResults(0, ${pageSize})">1</a></li>`;
            if (totalPages > 2) {
                pageButtons += `<li class="page-item ${currentPage === 1 ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionResults(1, ${pageSize})">2</a></li>`;
            }
        }

        // Show page numbers around the current page with ellipses
        if (currentPage > 2) {
            pageButtons += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 3, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            pageButtons += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionResults(${i}, ${pageSize})">${i + 1}</a></li>`;
        }

        if (currentPage < totalPages - 4) {
            pageButtons += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        // Always show the last two pages
        if (totalPages > 2) {
            if (totalPages > 3) {
                pageButtons += `<li class="page-item ${currentPage === totalPages - 2 ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionResults(${totalPages - 2}, ${pageSize})">${totalPages - 1}</a></li>`;
            }
            pageButtons += `<li class="page-item ${currentPage === totalPages - 1 ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionResults(${totalPages - 1}, ${pageSize})">${totalPages}</a></li>`;
        }
    }

    // Right button
    if (currentPage < totalPages - 1) {
        pageButtons += `<li class="page-item"><a class="page-link" onclick="findAllInjectionResults(${currentPage + 1}, ${pageSize})">&raquo;</a></li>`;
    } else {
        pageButtons += `<li class="page-item disabled"><span class="page-link">&raquo;</span></li>`;
    }

    paginationContainer.innerHTML = `<ul class="pagination">${pageButtons}</ul>`;
    document.getElementById("dropdownMenuButton").innerHTML = pageSize;
}

function loadInjectionPlace(injectionPlace) {
    $.ajax({
        url: "/api/injection-result/places",
        success: function(places) {
        	if(injectionPlace !== undefined) {
        		$("#injectionplace")[0].innerHTML = "";
        		places.forEach(place => {
        		if(place === injectionPlace) {
        			$("#injectionplace")[0].innerHTML += `<option value="${place}" selected>${place}</option>`;
        		} else {
                    $("#injectionplace")[0].innerHTML += `<option value="${place}">${place}</option>`;
        		}
                });
        	} else {
                const placeSelect = document.getElementById('injectionplace');
                placeSelect.innerHTML = '<option value="">--Select Place--</option>';
                places.forEach(place => {
                    const option = document.createElement('option');
                    option.value = place;
                    option.textContent = place;
                    placeSelect.appendChild(option);
                });
        	}
        },
        error: function(xhr) {
            console.error("Error at /api/injection-result/places, error code: " + xhr.status);
        }
    });
}

function addInjectionResult() {
    const injectionResult = {
    	injectionResultId: $("#injectionresultid")[0].value !== "" ? $("#injectionresultid")[0].value : null,
        customerId: $("#customer")[0].value,
        vaccineTypeId: $("#vaccineTypeName")[0].value,
        vaccineId: $("#vaccineName")[0].value,
        numberOfInjection: $("#injection")[0].value,
        injectionDate: $("#injectiondate")[0].value,
        nextInjectionDate: $("#nextinjectiondate")[0].value,
        injectionPlace: $("#injectionplace")[0].value,
    };

	$.ajax({
		url: "/api/injection-result/add",
		method: "POST",
		contentType: "application/json",
		data: JSON.stringify(injectionResult),
		success: function(stringData) {
			alert(stringData);
			$('#add-injection-result-form')[0].reset();
			setupDropdown();
		},
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
                } catch (error) {
                	console.error("an expected error occurred at create/update result\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
                }
            }
            else {
                console.error("an expected error occurred at create/update result\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
            }
        }
	});
}

function updateSelectedInjectionResult()   {
    const checkbox = document.querySelectorAll('#injection-result-list-content input[type="checkbox"]:checked');

    if (checkbox.length !== 1) {
        alert("Please select only one injection result");
        return;
    }
    const selectedRow = checkbox[0].closest('tr');
    const injectionResultId = selectedRow.querySelector('td[hidden]').textContent.trim();

    if (!injectionResultId) {
        console.error('Injection Result ID not found.');
        return;
    }
    injectionResultTempId = injectionResultId;
    fetchInjectionResult('injection-result-create.html');

}

function updateInjectionResultDetail(injectionResultId) {

	$.ajax({
		url: "/api/injection-result/detail/" + injectionResultId,
		success: function(ir) {
			console.log("checkpoint 2");
			$('#injectionresultid')[0].value = ir.injectionResultId;
            $('#injection')[0].value = ir.numberOfInjection;
            $('#injectiondate')[0].value = ir.injectionDate;
            $('#nextinjectiondate')[0].value = ir.nextInjectionDate;
            $('#injectionplace')[0].value = ir.injectionPlace;
            setupDropdown(ir.customer.fullName, ir.vaccineFromInjectionResult.vaccineType.vaccineTypeName);
			vaccineNameForDropdown = ir.vaccineFromInjectionResult.vaccineName;
			loadInjectionPlace(ir.injectionPlace);
		},
		error: function(xhr) {
			console.error("error at getting result detail\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
		}
	});
}

function showInjectionResultDetails(injectionResultId) {

	$.ajax({
		url: "/api/injection-result/detail/" + injectionResultId,
		success: function(ir) {
			$("#modalInjection")[0].value = ir.numberOfInjection;
			$("#modalInjectionDate")[0].value = ir.injectionDate;
			$("#modalNextInjectionDate")[0].value = ir.nextInjectionDate;
			$("#modalInjectionPlace")[0].value = ir.injectionPlace;
			$('#modalCustomerInfo')[0].value = `${ir.customer.customerId}-${ir.customer.fullName}-${ir.customer.dateOfBirth}`;
			$("#modalVaccineName")[0].value = ir.vaccineFromInjectionResult.vaccineName;
			$("#modalVaccineTypeName")[0].value = ir.vaccineFromInjectionResult.vaccineType.vaccineTypeName;
			var modal = new bootstrap.Modal(document.getElementById('injectionResultModal'));
            modal.show();
		},
		error: function(xhr) {
			console.error("error at getting result detail\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
		}
	});
}

function deleteSelectedInjectionResults() {
    // Get all checked checkboxes
    const checkboxes = document.querySelectorAll('#injection-result-list-content input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        alert("Please select at least one injection result");
        return;
    }

    // Gather IDs of selected injection results
    const idsToDelete = Array.from(checkboxes).map(checkbox => {
        const row = checkbox.closest('tr');
        return row.querySelector('td[hidden]').textContent.trim(); // Hidden ID
    });

    if (idsToDelete.length === 0) {
        console.error('No IDs found for deletion.');
        return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete ${idsToDelete.length} injection result(s)?`)) {
        return;
    }

	$.ajax({
		url: "/api/injection-result/delete",
		method: "DELETE",
		contentType: "application/json",
		data: JSON.stringify(idsToDelete),
		success: function(stringData) {
			alert(stringData);
			fetchInjectionResult('injection-result-list.html');
		},
		error: function(xhr) {
			console.error("error deleting detail\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
		}
	});
}

function resetInputInjectionResult() {
	const tempId = $("#injectionresultid")[0].value;
    $("#add-injection-result-form")[0].reset();
    $("#injectionresultid")[0].value = tempId;
    setupDropdown();
    loadInjectionPlace();
}









