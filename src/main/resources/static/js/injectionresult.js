//show list with pagination
function findAllInjectionResultsWithPagination(page, pageSize) {
    const searchInputElement = document.getElementById('searchInput');
    const query = searchInputElement ? searchInputElement.value : '';

    fetch(`/injection-result/findAllWithPagination?searchInput=${encodeURIComponent(query)}&page=${page}&size=${pageSize}`)
        .then(response => response.json())
        .then(injectionResults => {
            const tableBody = document.getElementById('injection-result-list-content');
            tableBody.innerHTML = '';

            injectionResults.content.forEach(result => {
                const row = document.createElement('tr');
                row.innerHTML = `
                        <td class="text-center check-boxes"><input type="checkbox"></td>
                        <td hidden>${result.injectionResultId}</td>
                        <td class="text-start"><a class="link-offset-2 link-underline link-underline-opacity-0" href="#" onclick="showInjectionResultDetails('${result.injectionResultId}')">${result.customerInfo}</a></td>
                        <td class="text-start">${result.vaccineName}</td>
                        <td class="text-start">${result.vaccineTypeName}</td>
                        <td>${result.numberOfInjection}</td>
                        <td>${result.injectionDate}</td>
                        <td>${result.nextInjectionDate}</td>
                    `;
                tableBody.appendChild(row);
            });
            updatePaginationControlsIR(injectionResults.number, injectionResults.totalPages, pageSize, injectionResults.totalElements);
        })
        .catch(error => console.error('Error fetching injection results', error));
}

//-handle paging
function updatePaginationControlsIR(currentPage, totalPages, pageSize, totalElements) {
    document.getElementById("start-entry").innerHTML = currentPage === 0 ? 1 : currentPage * pageSize + 1;
    document.getElementById("end-entry").innerHTML = currentPage === totalPages - 1 ? totalElements : (currentPage + 1) * pageSize;
    document.getElementById("total-entries").innerHTML = totalElements;

    const paginationContainer = document.getElementById("page-buttons");
    let pageButtons = '';

    // Left button
    if (currentPage > 0) {
        pageButtons += `<li class="page-item"><a class="page-link" onclick="findAllInjectionResultsWithPagination(${currentPage - 1}, ${pageSize})">&laquo;</a></li>`;
    } else {
        pageButtons += `<li class="page-item disabled"><span class="page-link">&laquo;</span></li>`;
    }

    // Show all pages if totalPages < 10
    if (totalPages <= 10) {
        for (let i = 0; i < totalPages; i++) {
            pageButtons += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionResultsWithPagination(${i}, ${pageSize})">${i + 1}</a></li>`;
        }
    } else {
        // Always show page 1 and 2
        if (totalPages > 1) {
            pageButtons += `<li class="page-item ${currentPage === 0 ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionResultsWithPagination(0, ${pageSize})">1</a></li>`;
            if (totalPages > 2) {
                pageButtons += `<li class="page-item ${currentPage === 1 ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionResultsWithPagination(1, ${pageSize})">2</a></li>`;
            }
        }

        // Show page numbers around the current page with ellipses
        if (currentPage > 2) {
            pageButtons += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 3, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            pageButtons += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionResultsWithPagination(${i}, ${pageSize})">${i + 1}</a></li>`;
        }

        if (currentPage < totalPages - 4) {
            pageButtons += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        // Always show the last two pages
        if (totalPages > 2) {
            if (totalPages > 3) {
                pageButtons += `<li class="page-item ${currentPage === totalPages - 2 ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionResultsWithPagination(${totalPages - 2}, ${pageSize})">${totalPages - 1}</a></li>`;
            }
            pageButtons += `<li class="page-item ${currentPage === totalPages - 1 ? 'active' : ''}"><a class="page-link" onclick="findAllInjectionResultsWithPagination(${totalPages - 1}, ${pageSize})">${totalPages}</a></li>`;
        }
    }

    // Right button
    if (currentPage < totalPages - 1) {
        pageButtons += `<li class="page-item"><a class="page-link" onclick="findAllInjectionResultsWithPagination(${currentPage + 1}, ${pageSize})">&raquo;</a></li>`;
    } else {
        pageButtons += `<li class="page-item disabled"><span class="page-link">&raquo;</span></li>`;
    }

    paginationContainer.innerHTML = `<ul class="pagination">${pageButtons}</ul>`;
    document.getElementById("dropdownMenuButton").innerHTML = pageSize;
}

//--search
function searchInjectionResults(page) {
    const query = document.getElementById('searchInput').value;
    const currentPageSize = parseInt(document.getElementById("dropdownMenuButton").innerHTML, 10);

    fetch(`/injection-result/findAllWithPagination?searchInput=${encodeURIComponent(query)}&page=${page}&size=${currentPageSize}`)
        .then(response => response.json())
        .then(injectionResults => {
            const tableBody = document.getElementById('injection-result-list-content');
            tableBody.innerHTML = '';

            injectionResults.content.forEach(result => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="text-center check-boxes "><input type="checkbox"></td>
                    <td hidden>${result.injectionResultId}</td>
                    <td class="text-start"><a class="link-offset-2 link-underline link-underline-opacity-0" href="#">${result.customerInfo}</a></td>
                    <td class="text-start">${result.vaccineName}</td>
                    <td class="text-start">${result.vaccineTypeName}</td>
                    <td>${result.numberOfInjection}</td>
                    <td>${result.injectionDate}</td>
                    <td>${result.nextInjectionDate}</td>
                `;
                tableBody.appendChild(row);
            });
            updatePaginationControlsIR(injectionResults.number, injectionResults.totalPages, currentPageSize, injectionResults.totalElements);
        })
        .catch(error => console.error('Error fetching injection results data:', error));
}

//check all
// function checkAllInjectionResultBoxes() {
//     const selectAllCheckbox = document.getElementById('mother-checkbox');
//     const checkboxes = document.querySelectorAll('.check-boxes input[type="checkbox"]');
//     checkboxes.forEach(function (checkbox) {
//         checkbox.checked = selectAllCheckbox.checked;
//     });
// }


// Function to load customers
function loadCustomers() {
    fetch('/customer/c-for-add-ir')
        .then(response => response.json())
        .then(customers => {
            const customerSelect = document.getElementById('customer');
            customerSelect.innerHTML = '<option selected>--Select Customer--</option>';

            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.text = `${customer.id} - ${customer.name} - ${customer.dateOfBirth}`;
                customerSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading customers:', error));
}


// Load vaccine types and initially hide the vaccine names dropdown
function loadVaccineTypeName() {
    fetch('/vaccine-type/vt-for-add-ir')
        .then(response => response.json())
        .then(vaccineTypes => {
            const vaccineTypeSelect = document.getElementById('vaccinetypename');
            vaccineTypeSelect.innerHTML = '<option selected>--Select Vaccine Type Name--</option>';

            vaccineTypes.forEach(vaccineType => {
                const option = document.createElement('option');
                option.value = vaccineType.id;
                option.text = vaccineType.name;
                vaccineTypeSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading vaccine types:', error));
}

// Load vaccines based on selected vaccine type
function loadVaccines(vaccineTypeId) {
    fetch(`/vaccine/v-for-add-ir?vaccineTypeId=${vaccineTypeId}`)
        .then(response => response.json())
        .then(vaccines => {
            const vaccineSelect = document.getElementById('vaccinename');
            vaccineSelect.innerHTML = '<option selected>--Select Vaccine--</option>';
            vaccineSelect.style.display = 'block'; // Show the vaccine name dropdown

            vaccines.forEach(vaccine => {
                const option = document.createElement('option');
                option.value = vaccine.id;
                option.text = vaccine.name;
                vaccineSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading vaccines:', error));
}

// Event listener for vaccine type dropdown change
document.getElementById('vaccinetypename').addEventListener('change', function() {
    const selectedVaccineTypeId = this.value;
    const vaccineSelect = document.getElementById('vaccinename');

    // Clear previous vaccine names and hide dropdown if no vaccine type is selected
    vaccineSelect.innerHTML = '<option selected>--Select Vaccine--</option>';
    vaccineSelect.style.display = 'none';

    if (selectedVaccineTypeId) {
        loadVaccines(selectedVaccineTypeId);
    }
});

// Initial load of vaccine types on page load
document.addEventListener('DOMContentLoaded', function() {
    loadVaccineTypeName();
});

//load injection place from file
function loadInjectionPlace() {
    fetch('/injection-result/places')
        .then(response => response.json())
        .then(places => {
            const placeSelect = document.getElementById('injectionplace');
            placeSelect.innerHTML = '<option value="">--Select Place--</option>'; // Clear previous options
            places.forEach(place => {
                const option = document.createElement('option');
                option.value = place;
                option.textContent = place;
                placeSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading places:', error));
}

// // Call all the functions to load data when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCustomers();
    loadVaccineTypeName()
    loadVaccines();
    loadInjectionPlace();
});


//add
function addInjectionResult(event) {
    event.preventDefault(); // Prevent default form submission

    // Get form values
    const customerId = document.getElementById('customer').value.split(' - ')[0];  // Extract customerId only
    const vaccineTypeName = document.getElementById('vaccinetypename').value;
    const vaccineName = document.getElementById('vaccinename').value;
    const injection = document.getElementById('injection').value;
    const injectionDate = document.getElementById('injectiondate').value;
    const nextInjectionDate = document.getElementById('nextinjectiondate').value;
    const injectionPlace = document.getElementById('injectionplace').value;
    const injectionResultId = document.getElementById('injectionresultid').value;
    // Create the data object
    const data = {
        customerId: customerId, // Send only the customerId to the server
        vaccineTypeName: vaccineTypeName,
        vaccineName: vaccineName,
        injection: injection,
        injectionDate: injectionDate,
        nextInjectionDate: nextInjectionDate,
        injectionPlace: injectionPlace,
        injectionResultId: injectionResultId
    };

    // Send data to the server
    fetch('/injection-result/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => {
                    throw new Error(text || 'Failed to add injection result.');
                });
            }
        })
        .then(result => {
            alert('Injection result added successfully!');
            document.getElementById('add-injection-result-form').reset();
        })
        .catch(error => {
            console.error('Error adding injection result:', error);
            alert('Failed to add injection result. Please try again.');
        });
}

//--update
function updateSelectedInjectionResult() {
    const checkbox = document.querySelectorAll('#injection-result-list-content input[type="checkbox"]:checked');

    if (checkbox.length !== 1) {
        alert("Please select only one injection result");
        return;
    }
    // Check if the selected row exists and retrieve the hidden ID
    const selectedRow = checkbox[0].closest('tr');
    const injectionResultId = selectedRow.querySelector('td[hidden]').textContent.trim(); // Hidden ID

    if (!injectionResultId) {
        console.error('Injection Result ID not found.');
        return;
    }
    console.log('Selected injectionResultId:', injectionResultId);
    fetchUpdateInjectionResult('injection-result-create.html', injectionResultId);  // Pass ID to the update handler
}


// Function to update injection result details in the form
function updateInjectionResultDetail(injectionResultId) {
    fetch(`/injection-result/detail/` + injectionResultId)
        .then(response => response.json())
        .then(injectionResult => {
            // Populate form fields with the injection result data
            document.getElementById('injectionresultid').value = injectionResult.injectionResultId;
            document.getElementById('injection').value = injectionResult.injection;
            document.getElementById('injectiondate').value = injectionResult.injectionDate;
            document.getElementById('nextinjectiondate').value = injectionResult.nextInjectionDate;
            document.getElementById('injectionplace').value = injectionResult.injectionPlace;

            // Load customers, vaccine types, vaccines, and injection places first, then set the values
            loadCustomers(() => {
                document.getElementById('customer').value = injectionResult.customerId;
            });
            loadVaccineTypeName(() => {
                document.getElementById('vaccinetypename').value = injectionResult.vaccineTypeId;
            });
            loadVaccines(injectionResult.vaccineTypeId, () => {
                document.getElementById('vaccinename').value = injectionResult.vaccineId;
            });
            loadInjectionPlace();
        })
        .catch(error => console.error('Error fetching injection result data', error));
}
//show detail on modal
// function showInjectionResultDetails(injectionResultId) {
//     // Fetch employee details by employeeId
//     fetch(`/injection-result/detail/` + injectionResultId)
//         .then(response => response.json())  // Assuming the response is in JSON format
//         .then(injectionResult => {
//             // Populate the modal fields with employee data
//             document.getElementById('modalCustomerInfo').value = injectionResult.customerId;
//             document.getElementById('modalInjection').value = injectionResult.injection;
//             document.getElementById('modalInjectionDate').value = injectionResult.injectionDate;
//             document.getElementById('modalNextInjectionDate').value = injectionResult.nextInjectionDate;
//             document.getElementById('modalInjectionPlace').value = injectionResult.injectionPlace;
//
//             // Show the modal
//             var modal = new bootstrap.Modal(document.getElementById('injectionResulModal'));
//             modal.show();
//         })
//         .catch(error => {
//             console.error('Error fetching injection result details:', error);
//             alert('Failed to load injection result details. Please try again.');
//         });
// }
// Function to fetch and show injection result details in a modal
function showInjectionResultDetails(injectionResultId) {
    // Fetch injection result details by ID
    fetch(`/injection-result/detail/` + injectionResultId)
        .then(response => response.json())
        .then(injectionResult => {
            // Populate the modal fields with the injection result data
            document.getElementById('modalInjection').value = injectionResult.injection;
            document.getElementById('modalInjectionDate').value = injectionResult.injectionDate;
            document.getElementById('modalNextInjectionDate').value = injectionResult.nextInjectionDate;
            document.getElementById('modalInjectionPlace').value = injectionResult.injectionPlace;
            // Fetch customer details
            // fetch(`/customer/detail/` + injectionResult.customerId)
            //     .then(response => response.json())
            //     .then(customer => {
            //         document.getElementById('modalCustomerInfo').value = `${customer.firstName} ${customer.lastName}`; // Adjust based on your customer fields
            //     })
            //     .catch(error => console.error('Error fetching customer details:', error));
            //
            // // Fetch vaccine details
            // fetch(`/vaccine/detail/` + injectionResult.vaccineId)
            //     .then(response => response.json())
            //     .then(vaccine => {
            //         document.getElementById('modalVaccineName').value = vaccine.vaccineName;
            //     })
            //     .catch(error => console.error('Error fetching vaccine details:', error));
            //
            // // Fetch vaccine type details
            // fetch(`/vaccine-type/detail/` + injectionResult.vaccineTypeId)
            //     .then(response => response.json())
            //     .then(vaccineType => {
            //         document.getElementById('modalVaccineTypeName').value = vaccineType.vaccineTypeName;
            //     })
            //     .catch(error => console.error('Error fetching vaccine type details:', error));

            // Show the modal
            var modal = new bootstrap.Modal(document.getElementById('injectionResultModal'));
            modal.show();
        })
        .catch(error => {
            console.error('Error fetching injection result details:', error);
            alert('Failed to load injection result details. Please try again.');
        });
}

// delete
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

    // Send delete request
    fetch('/injection-result/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(idsToDelete)
    })
        .then(response => response.json())
        .then(result => {
            if (result.code === 200) { // Assuming 200 indicates success
                alert('Deletion successful');
                fetchInjectionResult('injection-result-list.html'); // Reload the list
            } else {
                alert('Deletion failed: ' + result.description);
            }
        })
        .catch(error => console.error('Error deleting injection results:', error));
}


//reset button
function resetInputInjectionresult() {
    // Get all the fields
    const injectionResultId = document.getElementById('injectionresultid');
    const injection = document.getElementById('injection');
    const injectionDate = document.getElementById('injectiondate');

    // Get all dropdown lists
    const customerDropdown = document.getElementById('customer');
    const vaccineTypeDropdown = document.getElementById('vaccinetypename');
    const vaccineNameDropdown = document.getElementById('vaccinename');
    const placeOfInjectionDropdown = document.getElementById('injectionplace');

    // Reset only fields that are not disabled
    if (!injectionResultId.disabled) injectionResultId.value = '';
    if (!injection.disabled) injection.value = '';
    if (!injectionDate.disabled) injectionDate.value = '';

    // Reset dropdown lists to their default value (usually the first option or an empty option)
    if (!customerDropdown.disabled) customerDropdown.selectedIndex = 0; // Set to the first option
    if (!vaccineTypeDropdown.disabled) vaccineTypeDropdown.selectedIndex = 0; // Set to the first option
    if (!vaccineNameDropdown.disabled) vaccineNameDropdown.selectedIndex = 0; // Set to the first option
    if (!placeOfInjectionDropdown.disabled) placeOfInjectionDropdown.selectedIndex = 0; // Set to the first option
}









