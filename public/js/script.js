document.addEventListener("DOMContentLoaded", function () {
    const pendingTasks = document.getElementById("pending-tasks");
    const completedTasks = document.getElementById("completed-tasks");
    const showTasksBtn = document.getElementById("show-tasks");
    const showCompletedBtn = document.getElementById("show-completed");
    const sectionTitle = document.getElementById("section-title");
    const sectionIcon = document.getElementById("h2icon");
    const taskInputContainer = document.getElementById("task-input-container");
    

    // Show Pending Tasks
    showTasksBtn.addEventListener("click", function () {
        pendingTasks.style.display = "block";
        completedTasks.style.display = "none";
        sectionTitle.innerText = "My Day";
        sectionIcon.classList.remove("fa-check");
        sectionIcon.classList.add("fa-sun");
        taskInputContainer.style.display = "block"; 
        showTasksBtn.classList.add("active");
        showCompletedBtn.classList.remove("active");
    });

    // Show Completed Tasks
    showCompletedBtn.addEventListener("click", function () {
        pendingTasks.style.display = "none";
        completedTasks.style.display = "block";
        sectionTitle.innerText = "Completed";
        sectionIcon.classList.remove("fa-sun");
        sectionIcon.classList.add("fa-check");
        taskInputContainer.style.display = "none";
        showTasksBtn.classList.remove("active");
        showCompletedBtn.classList.add("active");
    });

    //show role management


    // Mark Task as Completed
    document.addEventListener("change", async function (event) {
        if (event.target.classList.contains("mark-completed")) {
            const taskId = event.target.getAttribute("data-id");
            const listItem = event.target.closest("li");

            try {
                const response = await fetch(`/user/update/${taskId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isCompleted: true })
                });

                if (response.ok) {
                    addToCompletedSection(listItem);
                } else {
                    alert("Failed to update task.");
                }
            } catch (error) {
                console.error("Error updating task:", error);
                alert("An error occurred. Please try again.");
            }
        }
    });

    // Move Task to Completed Section
    function addToCompletedSection(taskItem) {
        const completedList = document.querySelector("#completed-tasks ul");

        // Remove completion checkbox
        taskItem.querySelector(".mark-completed")?.remove();
        //Remove the edit button
        taskItem.querySelector(".edit-btn")?.remove();

        // Move task to completed list
        completedList.appendChild(taskItem);
    }

    // Event delegation for Edit functionality
    document.addEventListener("click", function (event) {
        const editButton = event.target.closest(".edit-btn");

        if (editButton) {
            const listItem = editButton.closest("li");
            const taskText = listItem.querySelector(".task-text");
            const taskId = listItem.querySelector(".mark-completed")?.getAttribute("data-id") || listItem.getAttribute("data-id");

            if (!taskId) return;

            enableEditing(taskText, taskId);
        }
    });

    // Enable task editing
    function enableEditing(taskText, taskId) {
        taskText.contentEditable = "true";
        taskText.focus();

        taskText.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                saveTask(taskId, taskText);
            }
        });
    }

    // Function to save edited task
    async function saveTask(taskId, taskText) {
        const updatedText = taskText.textContent.trim();

        if (!updatedText) {
            alert("Task cannot be empty!");
            return;
        }

        try {
            const response = await fetch(`/user/update/${taskId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: updatedText })
            });

            if (response.ok) {
                taskText.contentEditable = "false";
            } else {
                alert("Failed to update task.");
            }
        } catch (error) {
            console.error("Error saving task:", error);
            alert("An error occurred. Please try again.");
        }
    }

    // Event delegation for deleting a task
    document.addEventListener("click", function (event) {
        const deleteButton = event.target.closest(".delete-btn");
        if (deleteButton) {
            event.preventDefault();
            const taskId = deleteButton.getAttribute("data-id");
            const listItem = deleteButton.closest("li");

            deleteTask(taskId, listItem);
        }
    });

    // Function to delete a task
    async function deleteTask(taskId, listItem) {
        try {
            const response = await fetch(`/user/delete/${taskId}`, { method: "POST" });

            if (response.ok) {
                listItem.remove();
            } else {
                alert("Failed to delete task.");
            }
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("An error occurred. Please try again.");
        }
    }
});
