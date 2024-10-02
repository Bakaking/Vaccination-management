function ajaxNews(filename){
    $.ajax({
        url: "/api/news/getAjax",
        data: {filename: filename},
        success: function(stringData){
            $("#ajax-content")[0].innerHTML = stringData;
            if (filename === "show-news.html") {
            	$("#ajax-title")[0].innerHTML = "WELCOME TO VACCINE MANAGEMENT SYSTEM";
            	findNews(0);
            }
            else if(filename === "news-list.html"){
                $("#ajax-title")[0].innerHTML = "NEWS LIST";
                findNews(0);
            } else {
                $("#ajax-title")[0].innerHTML = "CREATE NEWS";
            }
        },
        error: function(xhr){
            console.error("error at getting ajax document for news\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
        }
    });
}

function findNews(currentPage){
	let pageSize;
    if($("#ajax-title")[0].textContent === "NEWS LIST") {
       pageSize = parseInt($("#dropdownMenuButton")[0].textContent, 10);
	}
    $.ajax({
        url: "/api/news/findAllNews",
        data: {
            searchInput: $("#searchInput")[0] === undefined ? "" : $("#searchInput")[0].value,
            page: currentPage,
            size: $("#dropdownMenuButton")[0] === undefined ? 10 : parseInt($("#dropdownMenuButton")[0].textContent, 10)
        },
        success: function(pageData){
        	if($("#ajax-title")[0].textContent === "WELCOME TO VACCINE MANAGEMENT SYSTEM") {
        		$("#news-show-content")[0].innerHTML = "";
        		pageData.content.forEach(data => {
        		$("#news-show-content")[0].innerHTML += `
                    <div class="row mb-4">
                            <div class="col-md-12">
                                <div class="card">
                                    <div class="card-header">
                                        <span class="post-date text-muted">Posting Date: ${data.postDate}</span>
                                    </div>
                                    <div class="card-body">
                                        <a class="card-title link-offset-2 link-underline link-underline-opacity-0" href="https://fpt.com/vi/tin-tuc">
                                        <h5>${data.title}</h5>
                                        </a>
                                        <p class="card-text">${data.content.replace(/\n/g, '<br>')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
        		});
        	} else {
                $("#news-list-content")[0].innerHTML = "";
                pageData.content.forEach(data => {
                    $("#news-list-content")[0].innerHTML += `
                    <tr>
                        <td class="d-none"><input type="text" value="${data.newsId}" disabled></td>
                        <td class="text-center check-boxes"><input type="checkbox"></td>
                        <td>${data.title}</td>
                        <td>${data.content}</td>
                        <td>${data.postDate}</td>
                    </tr>
                    `;
                });
                updateNewsPageControls(pageData.number, pageData.totalPages, pageSize, pageData.totalElements);
        	}
        },
        error: function(xhr){
            console.error("error at getting ajax document for news\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
        }
    });
}

function search(pageNumber) {
    const searchInput = document.getElementById('searchInput').value;
    const entries = document.getElementById('show').value;

    // Call API to fetch filtered news
    fetch(`/api/news/search?query=${searchInput}&page=${pageNumber}&size=${entries}`)
        .then(response => response.json())
        .then(data => {
            const newsListContent = document.getElementById('news-list-content');
            newsListContent.innerHTML = ''; // Clear current content

            // Loop through news and populate table
            data.news.forEach(news => {
                newsListContent.innerHTML += `
                    <tr>
                        <td class="text-center"><input type="checkbox" value="${news.id}"></td>
                        <td>${news.title}</td>
                        <td>${news.content}</td>
                        <td>${new Date(news.postDate).toLocaleDateString()}</td>
                    </tr>
                `;
            });

            // Update pagination and entries info
            document.getElementById('start-entry').innerText = data.start;
            document.getElementById('end-entry').innerText = data.end;
document.getElementById('total-entries').innerText = data.total;
            updatePagination(data.totalPages, pageNumber);
        })
        .catch(error => console.error('Error fetching news:', error));
}

function updateNews() {
    const checkboxes = $(".check-boxes input[type='checkbox']:checked");
    if (checkboxes.length != 1) {
        alert("Please select only 1 news item to update!");
        return;
    }
    const id = checkboxes[0].closest("tr").querySelector("td:nth-child(1) input").value;
    ajaxNews('news-create.html');

    $.ajax({
        url: "/api/news/findById",
        data: {id: id},
        success: function(news){
            $("#newsId")[0].value = news.newsId;
            $("#newsId")[0].disabled = true;
            $("#title")[0].value = news.title;
            $("#preview")[0].value = news.preview;
            $("#content")[0].value = news.content;

        },
        error: function(xhr){
            console.error("error at getting news detail for update\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
        }
    });
}

function deleteNews() {
    const checkboxes = document.querySelectorAll(".check-boxes input[type='checkbox']:checked");
    if (checkboxes.length < 1) {
        alert("Please select at least 1 news to delete!");
        return;
    }

    let idRequest = {
        ids: []
    };

    checkboxes.forEach(checkbox => {
        idRequest.ids.push(checkbox.closest("tr").querySelector("td:nth-child(1) input").value);
    });
    $.ajax({
        url: "/api/news/delete",
        method: "DELETE",
        contentType: "application/json",
        data: JSON.stringify(idRequest),
        success: function(stringData) {
            alert(stringData);
            findNews(0);
        },
        error: function(xhr) {
            console.error("Error at deleting news\nerror code: " + xhr.status + "\nerror message: " + xhr.responseText);
        }
    });
}

function saveNews() {
    const newsId = $('#newsId').val().trim();
    const title = $('#title').val().trim();
    const preview = $('#preview').val().trim();
    const content = $('#content').val().trim();

    if (!title || !preview || !content) {
        alert("Please fill all required fields.");
        return;
}

    // Đối tượng tin tức mới
    const news = {
        newsId: newsId,
        title: title,
        preview: preview,
        content: content
    };

    // Gửi request POST để lưu tin tức
    $.ajax({
        url: "/api/news/add",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(news),
        success: function(stringData) {
                alert(stringData);
                ajaxNews('news-list.html');
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

function resetInput() {
	if($("#newsId")[0].disabled === true) {
    	const tempId = $("#newsId")[0].value;
    	$("#news-form")[0].reset();
    	$("#newsId")[0].value = tempId;
	} else {
		$("#news-form")[0].reset();
	}
}

function fetchNews(filename) {
    $.ajax({
        url: "/api/news/getAjax",
        data: { filename: filename },
        dataType: "text",
        success: function(data) {
            // Inject the response content into the DOM
            $("#ajax-content")[0].innerHTML = data;
            if (filename === "news-list.html") {
                $("#ajax-title").html("NEWS LIST");
                listNews(0);
            } else {
                $("#ajax-title").html("CREATE NEWS");
                randomizeCaptcha();
            }
        },
        error: function(jqxhr, textStatus, errorThrown) {
            console.error("AJAX error:", textStatus, errorThrown);
        }
    });
}

function updateNewsPageControls(currentPage, totalPages, pageSize, totalElements) {
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
        pageButtons += `<li class="page-item"><a class="page-link" onclick="findNews(${currentPage - 1}, ${pageSize})">&laquo;</a></li>`;
    } else {
        pageButtons += `<li class="page-item disabled"><span class="page-link">&laquo;</span></li>`;
    }

    // Show all pages if totalPages < 10
    if (totalPages <= 10) {
        for (let i = 0; i < totalPages; i++) {
            pageButtons += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" onclick="findNews(${i}, ${pageSize})">${i + 1}</a></li>`;
        }
    } else {
        // Always show page 1 and 2
        if (totalPages > 1) {
            pageButtons += `<li class="page-item ${currentPage === 0 ? 'active' : ''}"><a class="page-link" onclick="findNews(0, ${pageSize})">1</a></li>`;
            if (totalPages > 2) {
pageButtons += `<li class="page-item ${currentPage === 1 ? 'active' : ''}"><a class="page-link" onclick="findNews(1, ${pageSize})">2</a></li>`;
            }
        }

        // Show page numbers around the current page with ellipses
        if (currentPage > 2) {
            pageButtons += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 3, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            pageButtons += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" onclick="findNews(${i}, ${pageSize})">${i + 1}</a></li>`;
        }

        if (currentPage < totalPages - 4) {
            pageButtons += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        // Always show the last two pages
        if (totalPages > 2) {
            if (totalPages > 3) {
                pageButtons += `<li class="page-item ${currentPage === totalPages - 2 ? 'active' : ''}"><a class="page-link" onclick="findNews(${totalPages - 2}, ${pageSize})">${totalPages - 1}</a></li>`;
            }
            pageButtons += `<li class="page-item ${currentPage === totalPages - 1 ? 'active' : ''}"><a class="page-link" onclick="findNews(${totalPages - 1}, ${pageSize})">${totalPages}</a></li>`;
        }
    }

    // Right button
    if (currentPage < totalPages - 1) {
        pageButtons += `<li class="page-item"><a class="page-link" onclick="findNews(${currentPage + 1}, ${pageSize})">&raquo;</a></li>`;
    } else {
        pageButtons += `<li class="page-item disabled"><span class="page-link">&raquo;</span></li>`;
    }

    paginationContainer.innerHTML = `<ul class="pagination">${pageButtons}</ul>`;
    $("#dropdownMenuButton")[0].innerHTML = pageSize;
}