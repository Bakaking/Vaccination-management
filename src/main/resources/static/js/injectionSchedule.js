function pressInjectionScheduleUpdateButton() {injectionScheduleUpdateBtn = true; injectionScheduleLink = false;}
function unPressInjectionScheduleUpdateButton() {injectionScheduleUpdateBtn = false; injectionScheduleLink = false;}
function setInjectionScheduleIdParam(id,vaccineId,status) {
	injectionScheduleIdParam = id;
	vaccineOfIsIdParam = vaccineId;
	if(status !== undefined) {
		injectionScheduleLink = true;
	}
}

// from dashboard
function fetchInjectionSchedule(filename){
    $.ajax({
        url: "/api/injection-schedule/getAjax",
        data: {filename: filename},
        success: function(ajaxData) {
            const checkboxes = $(".check-boxes input[type='checkbox']:checked");
            if(injectionScheduleUpdateBtn === true) {
                if (checkboxes.length !== 1 && injectionScheduleLink !== true) {
                    alert("please select only 1 injection schedule to update information!");
                    return;
                }
            }
            $('#ajax-content')[0].innerHTML = ajaxData;
            if(filename === "injection-schedule-list.html") {
            	$("#ajax-title")[0].innerHTML = "INJECTION SCHEDULE LIST";
            	findAllInjectionSchedule(0);
            } else {
            	$("#ajax-title")[0].innerHTML = "CREATE INJECTION SCHEDULE";
            	if(injectionScheduleUpdateBtn === true) {
            		if(injectionScheduleLink === false) {
            			vaccineOfIsIdParam = checkboxes[0].closest("tr").querySelector("td:nth-child(2) input").value;
            			updateInjectionSchedule(checkboxes);
            		} else {
            			updateInjectionSchedule();
            		}
            	} else {
            		findAllVaccineName();
            	}
            }
        },
        error: function(xhr) {
            console.error("error getting ajax document for injection schedule\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
        }
    });
}

function findAllInjectionSchedule(page){
    const query = $("#searchInput")[0].value;
    const pageSize = parseInt($("#dropdownMenuButton")[0].innerHTML, 10);
    $.ajax({
        url: "/api/injection-schedule/findAll",
        data: {
        	searchInput: query,
        	page: page,
        	size: pageSize
        },
        success: function(injectionSchedules){
            const tableBody = $("#injection-schedule-list")[0];
            tableBody.innerHTML = "";
            injectionSchedules.content.forEach(injectionScheduleDto => {
                const row = document.createElement('tr');
                row.innerHTML = `
                	<td class="d-none">
                		<input type="text" value="${injectionScheduleDto.injectionScheduleId}" disabled>
                	</td>
                	<td class="d-none">
                		<input type="text" value="${injectionScheduleDto.vaccineFromInjectionSchedule.vaccineId}" disabled>
                	</td>
                    <td class="text-center check-boxes">
                    	<input type="checkbox">
                    </td>
                    <td>
                    	<a class="link-offset-2 link-underline link-underline-opacity-0"
                            onclick="showInjectionScheduleDetails('${injectionScheduleDto.injectionScheduleId}')">
                            ${injectionScheduleDto.vaccineFromInjectionSchedule.vaccineName}
                    	</a>
                    </td>
                    <td>From <strong>${injectionScheduleDto.startDate}</strong> to <strong>${injectionScheduleDto.endDate}</strong></td>
                    <td>${injectionScheduleDto.place}</td>
                    <td>${injectionScheduleDto.status}</td>
                    <td>${injectionScheduleDto.injectionScheduleDescription}</td>
                `;
                tableBody.appendChild(row);
            });
            updatePageInjectionSchedule(injectionSchedules.number, injectionSchedules.totalPages, pageSize, injectionSchedules.totalElements);
        },
        error: function(xhr){
            console.error("error finding list of injection schedule\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
        }
    });
}

function updatePageInjectionSchedule(currentPage, totalPages, pageSize, totalElements) {
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
        pageButtons += `<li class="page-item"><a class="page-link" onclick="findAllInjectionSchedule(${currentPage - 1}, ${pageSize})">&laquo;</a></li>`;
    } else {
        pageButtons += `<li class="page-item disabled"><span class="page-link">&laquo;</span></li>`;
    }

    // Show all pages if totalPages < 10
    if (totalPages <= 10) {
        for (let i = 0; i < totalPages; i++) {
            pageButtons += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionSchedule(${i}, ${pageSize})">${i + 1}</a></li>`;
        }
    } else {
        // Always show page 1 and 2
        if (totalPages > 1) {
            pageButtons += `<li class="page-item ${currentPage === 0 ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionSchedule(0, ${pageSize})">1</a></li>`;
            if (totalPages > 2) {
                pageButtons += `<li class="page-item ${currentPage === 1 ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionSchedule(1, ${pageSize})">2</a></li>`;
            }
        }

        // Show page numbers around the current page with ellipses
        if (currentPage > 2) {
            pageButtons += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 3, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            pageButtons += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionSchedule(${i}, ${pageSize})">${i + 1}</a></li>`;
        }

        if (currentPage < totalPages - 4) {
            pageButtons += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        // Always show the last two pages
        if (totalPages > 2) {
            if (totalPages > 3) {
                pageButtons += `<li class="page-item ${currentPage === totalPages - 2 ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionSchedule(${totalPages - 2}, ${pageSize})">${totalPages - 1}</a></li>`;
            }
            pageButtons += `<li class="page-item ${currentPage === totalPages - 1 ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionSchedule(${totalPages - 1}, ${pageSize})">${totalPages}</a></li>`;
        }
    }

    // Right button
    if (currentPage < totalPages - 1) {
        pageButtons += `<li class="page-item"><a class="page-link" onclick="findAllInjectionSchedule(${currentPage + 1}, ${pageSize})">&raquo;</a></li>`;
    } else {
        pageButtons += `<li class="page-item disabled"><span class="page-link">&raquo;</span></li>`;
    }

    paginationContainer.innerHTML = `<ul class="pagination">${pageButtons}</ul>`;
    $("#dropdownMenuButton")[0].innerHTML = pageSize;
}

function resetInjectionSchedule(){
	const tempId = $("#injection-schedule-id")[0].value;
    $("#injection-schedule-create-form")[0].reset();
    findAllVaccineName();
    $("#injection-schedule-id")[0].value = tempId;
}

function updateInjectionSchedule(checkboxes) {
    injectionScheduleLink = false;
	let injectionScheduleId;
	if(checkboxes !== undefined) {
		injectionScheduleId = checkboxes[0].closest("tr").querySelector("td:nth-child(1) input").value;
	} else {
		injectionScheduleId = injectionScheduleIdParam;
	}
	$.ajax({
		url: "/api/injection-schedule/findById",
		data: {id: injectionScheduleId},
		success: function (is) {
			$("#injection-schedule-id")[0].value = is.injectionScheduleId;
			$("#vaccineName")[0].innerHTML = "<option value='fromUpdate' selected></option>";
			$("#from")[0].value = is.startDate;
			$("#to")[0].value = is.endDate;
			$("#place")[0].value = is.place;
			$("#note")[0].value = is.injectionScheduleDescription;
			findAllVaccineName();
		},
		error: function(xhr) {
			console.error("error at /.../findById\nerror code: " + xhr.status + "\nmessage: " + xhr.responseText);
		}
	});
}

function addInjectionSchedule(){

    const injectionSchedule = {
    	injectionScheduleId: $("#injection-schedule-id")[0].value,
        injectionScheduleDescription: $("#note")[0].value,
        endDate: $("#to")[0].value,
        place: $("#place")[0].value,
        startDate: $("#from")[0].value,
        vaccineId: $("#vaccineName")[0].value
    };

    $.ajax({
        url: "/api/injection-schedule/add",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(injectionSchedule),
        success: function(stringData) {
            alert(stringData);
            resetInjectionSchedule();
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
                console.error("an expected error occurred at create/update injection schedule\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
            }
        }
    });
}

function findAllVaccineName() {
	$.ajax({
		url: "/api/vaccine/findAllVaccineName",
		success: function(vaccines) {
			if($("#vaccineName")[0].value === "fromUpdate") {
				$("#vaccineName")[0].innerHTML = "";
				vaccines.forEach(vaccine => {
                    if(vaccine.vaccineId === vaccineOfIsIdParam) {
                    	$("#vaccineName")[0].innerHTML += `<option value="${vaccine.vaccineId}" selected>-- ${vaccine.vaccineName} --</option>`;
                    } else {
                    	$("#vaccineName")[0].innerHTML += `<option value="${vaccine.vaccineId}">-- ${vaccine.vaccineName} --</option>`;
                    }
                });
			} else {
				$("#vaccineName")[0].innerHTML = "<option value='' selected>-- Select Vaccine --</option>";
                vaccines.forEach(vaccine => {
                    $("#vaccineName")[0].innerHTML += `<option value="${vaccine.vaccineId}">-- ${vaccine.vaccineName} --</option>`;
                });
			}
		},
		error: function(xhr) {
			console.error("error at finding vaccine name\nerror code: " + xhr.status + "\nerror status: " + xhr.statusText + "\nerror message: " + xhr.responseText);
		}
	});
}

function showInjectionScheduleDetails(idParam) {
	$.ajax({
		url: "/api/injection-schedule/findById",
		data: {id: idParam},
		success: function(is) {
			$("#modalVaccineName")[0].value = is.vaccineFromInjectionSchedule.vaccineName;
			$("#modalInjectionScheduleTime")[0].value = `From ${is.startDate}to ${is.endDate}`;
			$("#modalInjectionSchedulePlace")[0].value = is.place;
			$("#modalInjectionScheduleStatus")[0].value = is.status;
			$("#modalInjectionScheduleNote")[0].value = is.injectionScheduleDescription;
			// Show the modal
            var modal = new bootstrap.Modal($('#injectionScheduleModal')[0]);
            modal.show();
		},
		error: function(xhr) {
			console.error("error finding injection schedule detail\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
		}
	});
}