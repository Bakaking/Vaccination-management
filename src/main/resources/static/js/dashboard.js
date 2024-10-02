let employeeUpdateBtn = false;
let selectedEmployeeId = null;
let vaccineTypeUpdateBtn = false;
let customerUpdateBtn = false;
let vaccineTypeDisplayObject;
let vaccineIdParam;
let injectionScheduleUpdateBtn = false;
let injectionScheduleIdParam;
let vaccineOfIsIdParam;
let injectionScheduleLink = false;
let InjectionResultUpdateBtn = false;
let injectionResultTempId;
let vaccineNameForDropdown;
let employeeCancelBtn = false;

function checkAllBoxes() {
    const selectAllCheckbox = $("#mother-checkbox")[0];
    const checkboxes = $(".check-boxes input[type='checkbox']").toArray();
    checkboxes.forEach(checkbox => checkbox.checked = selectAllCheckbox.checked);
}

function dropdownPageSize(pageSize) {
	document.getElementById("dropdownMenuButton").innerHTML = pageSize;
}

function backToHomePage() {
	ajaxNews("show-news.html");
}

function setPageSize(pageSize) {
	$("#dropdownMenuButton")[0].textContent = pageSize;
}

document.addEventListener("DOMContentLoaded", function () {
	// get news at home page
	ajaxNews("show-news.html");

	// get current username
	$.ajax({
		url: "/api/user/getCurrentUsernameAndEmail",
		method: "GET",
		success: function(user) {
			$("#current-username")[0].innerHTML = user.username.charAt(0).toUpperCase() + user.username.slice(1);
			if(user.username === "admin") {
				$("#userEmail")[0].innerHTML = "admin@fsoft.com.vn";
				$("#employeeManagementLocation")[0].innerHTML = `
					<a class="nav-link text-black d-flex justify-content-between" data-bs-toggle="collapse" data-bs-target="#employeeManagement"
                    aria-expanded="false" aria-controls="employeeManagement" id="employeeManagementTitle">
                     <div class="fw-medium">
                         Employee Management
                     </div>
                     <div>
                         <i class="bi bi-plus"></i>
                     </div>
                 </a>
                 <div class="sub-menu collapse " id="employeeManagement">
                     <a class="nav-link fw-medium" onclick="unPressEmployeeUpdateButton(); fetchEmployee('employee-list.html');">
                         Employee List
                     </a>
                     <a class="nav-link fw-medium" onclick="unPressEmployeeUpdateButton(); fetchEmployee('employee-create.html');">
                         Create Employee
                     </a>
                 </div>`;
				$("#vaccineTypeManagementLocation")[0].innerHTML = `
                 <a class="nav-link text-black d-flex justify-content-between" data-bs-toggle="collapse"
                    data-bs-target="#vaccineType"
                    aria-expanded="false" aria-controls="vaccineType">
                     <div class="fw-medium">
                         Vaccine Type Management
                     </div>
                     <div>
                         <i class="bi bi-plus"></i>
                     </div>
                 </a>
                 <div class="sub-menu collapse" id="vaccineType">
                     <a class="nav-link fw-medium" onclick="fetchVaccineType('vaccine-type-list.html')">
                         Vaccine Type List
                     </a>
                     <a class="nav-link fw-medium"
                        onclick="vaccineTypeUpdateNotPressed(); fetchVaccineType('vaccine-type-create.html');">
                         Create Vaccine Type
                     </a>
                 </div>
                 <a class="nav-link text-black d-flex justify-content-between" data-bs-toggle="collapse"
                    data-bs-target="#vaccine"
                    aria-expanded="false" aria-controls="vaccine">
                     <div class="fw-medium">
                         Vaccine Management
                     </div>
                     <div>
                         <i class="bi bi-plus"></i>
                     </div>
                 </a>
                 <div class="sub-menu collapse" id="vaccine">
                     <a class="nav-link fw-medium" onclick="fetchVaccine('vaccine-list.html')">
                         Vaccine List
                     </a>
                     <a class="nav-link fw-medium" onclick="fetchVaccine('create-vaccine.html')">
                         Create Vaccine
                     </a>
                 </div>
                 <a class="nav-link text-black d-flex justify-content-between" data-bs-toggle="collapse"
                    data-bs-target="#injectionSchedule"
                    aria-expanded="false" aria-controls="injectionSchedule">
                     <div class="fw-medium">
                         Injection Schedule
                     </div>
                     <div>
                         <i class="bi bi-plus"></i>
                     </div>
                 </a>
                 <div class="sub-menu collapse" id="injectionSchedule">
                     <a class="nav-link fw-medium"
                        onclick="unPressInjectionScheduleUpdateButton(); fetchInjectionSchedule('injection-schedule-list.html');">
                         Injection Schedule List
                     </a>
                     <a class="nav-link fw-medium"
                        onclick="unPressInjectionScheduleUpdateButton(); fetchInjectionSchedule('injection-schedule-create.html');">
                         Create Injection Schedule
                     </a>
                 </div>`;
                 $("#newsManagementLocation")[0].innerHTML = `
                 	<a class="nav-link text-black d-flex justify-content-between" data-bs-toggle="collapse"
                       data-bs-target="#report"
                       aria-expanded="false" aria-controls="report">
                        <div class="fw-medium">
                            Report
                        </div>
                        <div>
                            <i class="bi bi-plus"></i>
                        </div>
                    </a>
                    <div class="sub-menu collapse" id="report">
                        <a class="nav-link fw-medium " href="#" onclick="fetchReport('report-injection-result.html')">
                            Report Injection Result
                        </a>
                        <a class="nav-link fw-medium" href="#" onclick="fetchReport('report-customer.html')">
                            Report Customer
                        </a>
                        <a class="nav-link fw-medium" href="#" onclick="fetchReport('report-vaccine.html')">
                            Report Vaccine
                        </a>
                    </div>
                 `;
			} else {
				$("#userEmail")[0].innerHTML = user.email;
			}
		},
		error: function(xhr) {
			console.error("Error fetching current username!\nerror code:" + xhr.status + "\nerror message: " + xhr.responseText);
		}
	});
});