const API_BASE = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'index.html';
}


document.getElementById('logoutBtnTasks').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

let tasks = [];
let projects = [];
let currentStatusFilter = 'all';
let editingTaskId = null;

document.getElementById('addTaskBtn').addEventListener('click', () => {
    document.getElementById('taskForm').style.display = 'flex';
    document.getElementById('taskFormTitle').textContent = 'Add Task';
    document.getElementById('taskFormElement').reset();
    editingTaskId = null;
});

document.getElementById('cancelTask').addEventListener('click', () => {
    document.getElementById('taskForm').style.display = 'none';
});

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentStatusFilter = btn.dataset.status;
        renderTasks();
    });
});

async function loadData() {
    try {
        const [tasksRes, projectsRes] = await Promise.all([
            fetch(`${API_BASE}/tasks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_BASE}/projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);
        
        tasks = await tasksRes.json();
        projects = await projectsRes.json();
        populateProjects();
        renderTasks();
    } catch (err) {
        console.error(err);
    }
}

function populateProjects() {
    const select = document.getElementById('taskProject');
    select.innerHTML = '<option value="">Select Project</option>' + 
        projects.map(p => `<option value="${p._id}">${p.name}</option>`).join('');
}

function renderTasks() {
    let filteredTasks = tasks;
    if (currentStatusFilter !== 'all') {
        filteredTasks = tasks.filter(t => t.status === currentStatusFilter);
    }
    
    document.getElementById('tasksList').innerHTML = filteredTasks.map(task => {
        const statusClass = `status-${task.status}`;
        const projectName = projects.find(p => p._id === task.project?._id)?.name || 'No Project';
        const isOverdue = task.status !== 'completed' && task.dueDate && new Date(task.dueDate) < new Date();
        
        return `
            <div class="task-item ${task.status} ${isOverdue ? 'overdue' : ''}" data-status="${task.status}">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span>${projectName}</span>
                    ${task.dueDate ? `<span>${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                </div>
                <div style="margin: 1rem 0;">
                    <span class="status-badge ${statusClass}">${task.status.replace('-', ' ').toUpperCase()}</span>
                    ${task.assignedTo ? `<span>Assigned to: ${task.assignedTo.name}</span>` : ''}
                </div>
                <div class="task-actions">

                    ${JSON.parse(localStorage.getItem('user')).role === 'admin' ? `

                        <button
                            onclick="editTask('${task._id}')"
                            class="btn-small"
                        >
                            Edit
                        </button>

                        <button
                            onclick="deleteTask('${task._id}')"
                            class="btn-small delete-btn"
                        >
                            Delete
                        </button>

                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

async function editTask(id) {
    const task = tasks.find(t => t._id === id);
    document.getElementById('taskId').value = id;
    document.getElementById('taskProject').value = task.project?._id || '';
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDesc').value = task.description || '';
    document.getElementById('assignEmail').value = task.assignedTo?.email || '';
    document.getElementById('dueDate').value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskFormTitle').textContent = 'Edit Task';
    editingTaskId = id;
    document.getElementById('taskForm').style.display = 'flex';
}

document.getElementById('taskFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskData = {
        project: document.getElementById('taskProject').value,
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDesc').value,
        assignedTo: document.getElementById('assignEmail').value, 
        dueDate: document.getElementById('dueDate').value,
        status: document.getElementById('taskStatus').value
    };
    
    try {
        let res;
        if (editingTaskId) {
            res = await fetch(`${API_BASE}/tasks/${editingTaskId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(taskData)
            });
        } else {
            res = await fetch(`${API_BASE}/tasks`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(taskData)
            });
        }
        
        if (res.ok) {
            document.getElementById('taskForm').style.display = 'none';
            loadData();
        }
    } catch (err) {
        console.error(err);
    }
});
async function deleteTask(id) {

    const confirmDelete = confirm(
        'Are you sure you want to delete this task?'
    );

    if (!confirmDelete) return;

    try {

        const res = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (res.ok) {

            // reload tasks from backend
            await loadData();

            alert(data.msg);

        } else {

            alert(data.msg || 'Delete failed');
        }

    } catch (err) {

        console.error(err);

        alert('Server error');
    }
}
window.editTask = editTask;
window.deleteTask = deleteTask;
loadData();