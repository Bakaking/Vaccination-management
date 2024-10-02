function vaccineTypeUpdatePressed() {
	vaccineTypeUpdateBtn = true;
}
function vaccineTypeUpdateNotPressed() {
	vaccineTypeUpdateBtn = false;
}

function findAllVaccineType(page) {
    const query = $("#searchInput")[0].value;
	const pageSize = parseInt($("#dropdownMenuButton")[0].textContent, 10);
    $.ajax({
    	url: "/api/vaccine-type/findAll",
    	data: {
    		searchInput: query,
    		page: page,
    		size: pageSize
    	},
    	success: function(vaccineTypes) {
    		const tableBody = document.getElementById('vaccine-type-list');
            tableBody.innerHTML = '';
            vaccineTypes.content.forEach(vaccineType => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="text-center check-boxes"><input type="checkbox" ></td>
                    <td>
                    <a href="#" class="link-offset-2 link-underline link-underline-opacity-0"
                    onclick="vaccineTypeUpdatePressed(); fetchUpdateVaccineType('vaccine-type-create.html','${vaccineType.vaccineTypeId}');" >${vaccineType.vaccineTypeId}</a>
                    </td>
                    <td>${vaccineType.vaccineTypeName}</td>
                    <td>${vaccineType.vaccineTypeDescription}</td>
                    <td>${vaccineType.vaccineTypeStatus}</td>
                `;
                tableBody.appendChild(row);
            });
            updatePageVaccineType(vaccineTypes.number, vaccineTypes.totalPages, pageSize, vaccineTypes.totalElements);
    	},
    	error: function(xhr) {
    		console.error("fail to fetch list of vaccine type\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
    	}
    });
}

function updatePageVaccineType(currentPage, totalPages, pageSize, totalElements) {
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
        pageButtons += `<li class="page-item"><a class="page-link" onclick="findAllVaccineType(${currentPage - 1})">&laquo;</a></li>`;
    } else {
        pageButtons += `<li class="page-item disabled"><span class="page-link">&laquo;</span></li>`;
    }

    // Show all pages if totalPages < 10
    if (totalPages <= 10) {
        for (let i = 0; i < totalPages; i++) {
            pageButtons += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" onclick="findAllVaccineType(${i})">${i + 1}</a></li>`;
        }
    } else {
        // Always show page 1 and 2
        if (totalPages > 1) {
            pageButtons += `<li class="page-item ${currentPage === 0 ? 'active' : ''}"><a class="page-link" onclick="findAllVaccineType(0)">1</a></li>`;
            if (totalPages > 2) {
                pageButtons += `<li class="page-item ${currentPage === 1 ? 'active' : ''}"><a class="page-link" onclick="findAllVaccineType(1)">2</a></li>`;
            }
        }

        // Show page numbers around the current page with ellipses
        if (currentPage > 2) {
            pageButtons += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 3, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            pageButtons += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" onclick="findAllVaccineType(${i})">${i + 1}</a></li>`;
        }

        if (currentPage < totalPages - 4) {
            pageButtons += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        // Always show the last two pages
        if (totalPages > 2) {
            if (totalPages > 3) {
                pageButtons += `<li class="page-item ${currentPage === totalPages - 2 ? 'active' : ''}"><a class="page-link" onclick="findAllVaccineType(${totalPages - 2})">${totalPages - 1}</a></li>`;
            }
            pageButtons += `<li class="page-item ${currentPage === totalPages - 1 ? 'active' : ''}"><a class="page-link" onclick="findAllVaccineType(${totalPages - 1})">${totalPages}</a></li>`;
        }
    }

    // Right button
    if (currentPage < totalPages - 1) {
        pageButtons += `<li class="page-item"><a class="page-link" onclick="findAllVaccineType(${currentPage + 1})">&raquo;</a></li>`;
    } else {
        pageButtons += `<li class="page-item disabled"><span class="page-link">&raquo;</span></li>`;
    }

    paginationContainer.innerHTML = `<ul class="pagination">${pageButtons}</ul>`;
    document.getElementById("dropdownMenuButton").innerHTML = pageSize;
}

// Call Ajax to load vaccine type list
function fetchVaccineType(filename) {
	$.ajax({
		url: "/api/vaccine-type/getAjax",
		data: {filename: filename},
		success: function(ajaxData) {
			document.getElementById('ajax-content').innerHTML = ajaxData;
                if(filename === "vaccine-type-list.html") {
                    findAllVaccineType(0);
                    document.getElementById("ajax-title").innerHTML="VACCINE TYPE LIST";
                }
                else {
                	document.getElementById("ajax-title").innerHTML="CREATE VACCINE TYPE";
                	if(vaccineTypeUpdateBtn == true) {
                		updateVaccineTypeDetail(vaccineTypeId);
                	}
                }
		},
		error: function(xhr) {
			console.error("error fetching ajax document for vaccineType list\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
		}
	});
}

// Add new vaccine type
function addVaccineType() {
    const activeInput = document.querySelector('input[name="vaccineTypeStatus"]:checked');
    const vaccineType = {
        vaccineTypeId : document.getElementById('vaccineTypeId').value,
        vaccineTypeName: document.getElementById('vaccineTypeName').value,
        vaccineTypeDescription: document.getElementById('vaccineTypeDescription').value,
        vaccineTypeStatus: activeInput ? "ACTIVE" : "INACTIVE",
        vaccineTypeImage : null
    };

    const imageFile = document.getElementById('image').files[0];

    if (imageFile) {
        const reader = new FileReader()
        reader.onloadend = function () {
            vaccineType.vaccineTypeImage = reader.result.split(',')[1].replace(/\s/g, '');
            sendVaccineTypeData(vaccineType);
        };
        reader.readAsDataURL(imageFile);
    } else {
        sendVaccineTypeData(vaccineType);
    }
}

function sendVaccineTypeData(vaccineType) {
	if (vaccineTypeUpdateBtn === true && vaccineType.vaccineTypeImage === null) {
		vaccineType.vaccineTypeImage = "null-image";
	}
    $.ajax({
    	url: "/api/vaccine-type/add",
    	method: "POST",
    	contentType: "application/json",
    	data: JSON.stringify(vaccineType),
    	success: function(stringData) {
    		alert(stringData);
    		$('#add-vaccine-type')[0].reset();
            $("#image-preview")[0].style.display = 'none';
            vaccineTypeUpdateNotPressed();
            $("#image")[0].required = true;
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
            		alert(xhr.responseText);
            	}
            }
            else {
                console.error("an expected error occurred at create/update vaccien type\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
            }
       	}
    });
}

// Make the vaccine type in-active in order to
function makeInactive() {
    let makeInactiveBody;
    const checkboxes = document.querySelectorAll('.check-boxes input[type="checkbox"]:checked');
    if(checkboxes.length === 0) {
        alert("No data to make inactive!");
        return;
    } else {
        let ids = [];
        makeInactiveBody = {
            vaccineTypeListIds : ids
        };
        checkboxes.forEach(checkbox => {
            ids.push(checkbox.closest('tr').querySelector('td:nth-child(2) a').textContent);
        });
	}
    $.ajax({
    	url: "/api/vaccine-type/make-inactive",
    	method: "PUT",
    	contentType: "application/json",
    	data: JSON.stringify(makeInactiveBody),
    	success: function (stringData) {
    		alert(stringData);
    		findAllVaccineType(0);
    	},
    	error: function(xhr) {
            alert(xhr.responseText);
            console.error("error making inactive for vaccine type\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
    	}
    });
}

function fetchUpdateVaccineType(filename, vaccineTypeId) {

    fetch(`/api/vaccine-type/getAjax?filename=${filename}`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('ajax-content').innerHTML = data;
            $("#ajax-title")[0].innerHTML = "UPDATE VACCINE";
            updateVaccineTypeDetail(vaccineTypeId);
        })
        .catch(error => console.error('Error fetching document:', error));
}

function updateVaccineTypeDetail(vaccineTypeId) {
	$.ajax({
		url: "/api/vaccine-type/detail/" + vaccineTypeId,
		success: function(vaccineType) {
			$("#vaccineTypeId")[0].value = vaccineType.vaccineTypeId;
            $("#vaccineTypeId")[0].disabled = true;
            $("#vaccineTypeName")[0].value = vaccineType.vaccineTypeName;
            $("#vaccineTypeDescription")[0].value = vaccineType.vaccineTypeDescription;
            $("#vaccineTypeStatus")[0].disabled = false;
            $("#image")[0].required = false;
            const statusCheckbox = $("#vaccineTypeStatus")[0];
            // status = "ACTIVE" ? checked = true : checked = false
            vaccineType.vaccineTypeStatus === "ACTIVE" ? statusCheckbox.checked = true : statusCheckbox.checked = false ;
            // Image preview (optional)
            if (vaccineType.vaccineTypeImage) {
                $("#image-preview")[0].src = "/api/vaccine-type/image/" + vaccineType.vaccineTypeId;
                $("#image-preview")[0].style.display = 'block';
            } else {
                $('#image-preview')[0].style.display = 'none';
            }
		},
		error: function(xhr) {
			console.error("error at /api/vaccine-type/detail/{id}: error code: " + xhr.status);
		}
	});
}

function resetVaccineTypeInput() {
	if(vaccineTypeUpdateBtn === true) {
		const vaccineTypeId = $("#vaccineTypeId")[0].value;
		$("#add-vaccine-type")[0].reset();
		$("#vaccineTypeId")[0].value = vaccineTypeId;
	}
	else {
		$("#add-vaccine-type")[0].reset();
	}
    $("#image-preview")[0].style.display = 'none';
}