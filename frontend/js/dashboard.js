const API_BASE = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'index.html';
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tasks = await res.json();
        
        const total = tasks.length;
        const pending = tasks.filter(t => t.status === 'pending').length;
        const inProgress = tasks.filter(t => t.status === 'in-progress').length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('inProgressTasks').textContent = inProgress;
        document.getElementById('completedTasks').textContent = completed;
        
        const now = new Date();
        const overdue = tasks.filter(task => 
            task.status !== 'completed' && 
            new Date(task.dueDate) < now
        );
        
        document.getElementById('overdueTasks').innerHTML = overdue.map(task => `
            <div class="task-item overdue">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
                    <span>${task.project?.name || 'No Project'}</span>
                </div>
            </div>
        `).join('');
        
    } catch (err) {
        console.error(err);
    }
}

loadDashboard();