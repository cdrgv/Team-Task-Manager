const API_BASE = 'http://localhost:5000/api';

const token = localStorage.getItem('token');

const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
    window.location.href = 'index.html';
}

if (user.role === 'member') {

    document.getElementById('addProjectBtn').style.display = 'none';

    document.querySelector('.header-section h2').textContent = 'Team Projects';
}

document.getElementById('logoutBtnProjects').addEventListener('click', () => {

    localStorage.removeItem('token');

    localStorage.removeItem('user');

    window.location.href = 'index.html';
});

let projects = [];

let editingId = null;

document.getElementById('addProjectBtn').addEventListener('click', showProjectForm);

document.getElementById('addMemberBtn').addEventListener('click', addMemberInput);

document.getElementById('cancelProject').addEventListener('click', hideProjectForm);

function showProjectForm() {

    document.getElementById('projectForm').style.display = 'flex';

    document.getElementById('formTitle').textContent = 'New Project';

    document.getElementById('projectFormElement').reset();

    document.getElementById('teamMembersContainer').innerHTML = `
        <div class="team-input-row">
            <input type="email" class="team-email" placeholder="Team Member Email">
            <button type="button" class="remove-member" style="display:none;">×</button>
        </div>
    `;

    editingId = null;
}

function hideProjectForm() {

    document.getElementById('projectForm').style.display = 'none';
}

function addMemberInput() {

    const container = document.getElementById('teamMembersContainer');

    const row = document.createElement('div');

    row.className = 'team-input-row';

    row.innerHTML = `
        <input type="email" class="team-email" placeholder="Team Member Email">
        <button type="button" class="remove-member">×</button>
    `;

    row.querySelector('.remove-member').addEventListener('click', () => {

        if (container.children.length > 1) {
            row.remove();
        }
    });

    container.appendChild(row);
}

async function loadProjects() {

    try {

        const res = await fetch(`${API_BASE}/projects`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        projects = await res.json();

        renderProjects();

    } catch (err) {

        console.error(err);
    }
}

function renderProjects() {

    document.getElementById('projectsList').innerHTML = projects.map(project => `

        <div class="project-card">

            <h3>${project.name}</h3>

            <p>${project.description || 'No description'}</p>

            <div class="team-members">
                Created by: ${project.createdBy.name}<br>
                Team: ${project.team?.map(m => m.name).join(', ') || 'Solo'}
            </div>

            <div class="project-actions">

                ${user.role === 'admin' ? `
                    <button
                        onclick="editProject('${project._id}')"
                        class="btn-small"
                    >
                        Edit
                    </button>

                    <button
                        onclick="deleteProject('${project._id}')"
                        class="btn-small delete-btn"
                    >
                        Delete
                    </button>
                ` : ''}

            </div>

        </div>

    `).join('');
}

async function editProject(id) {

    const project = projects.find(p => p._id === id);

    document.getElementById('projectId').value = id;

    document.getElementById('projectName').value = project.name;

    document.getElementById('projectDesc').value = project.description || '';

    document.getElementById('formTitle').textContent = 'Edit Project';

    const container = document.getElementById('teamMembersContainer');

    container.innerHTML = '';

    if (project.team && project.team.length > 0) {

        project.team.forEach(member => {

            const row = document.createElement('div');

            row.className = 'team-input-row';

            row.innerHTML = `
                <input
                    type="email"
                    class="team-email"
                    value="${member.email}"
                    placeholder="Team Member Email"
                >

                <button type="button" class="remove-member">
                    ×
                </button>
            `;

            row.querySelector('.remove-member').addEventListener('click', () => {

                if (container.children.length > 1) {
                    row.remove();
                }
            });

            container.appendChild(row);
        });

    } else {

        const row = document.createElement('div');

        row.className = 'team-input-row';

        row.innerHTML = `
            <input type="email" class="team-email" placeholder="Team Member Email">
            <button type="button" class="remove-member" style="display:none;">×</button>
        `;

        container.appendChild(row);
    }

    editingId = id;

    document.getElementById('projectForm').style.display = 'flex';
}

async function deleteProject(id) {

    const confirmDelete = confirm('Are you sure you want to delete this project?');

    if (!confirmDelete) return;

    try {

        const res = await fetch(`${API_BASE}/projects/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (res.ok) {

            // reload projects from backend
            await loadProjects();

            alert(data.msg);

        } else {

            alert(data.msg || 'Delete failed');
        }

    } catch (err) {

        console.error(err);

        alert('Server error');
    }
}
function getTeamMembers() {

    return Array.from(document.querySelectorAll('.team-email'))
        .map(input => input.value.trim())
        .filter(email => email);
}

document.getElementById('projectFormElement').addEventListener('submit', async (e) => {

    e.preventDefault();

    const projectData = {
        name: document.getElementById('projectName').value,
        description: document.getElementById('projectDesc').value,
        team: getTeamMembers()
    };

    try {

        let res;

        if (editingId) {

            res = await fetch(`${API_BASE}/projects/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(projectData)
            });

        } else {

            res = await fetch(`${API_BASE}/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(projectData)
            });
        }

        const data = await res.json();

        if (res.ok) {

            hideProjectForm();

            loadProjects();

            alert('Project saved successfully');

        } else {

            alert(data.msg || 'Failed to save project');
        }

    } catch (err) {

        console.error(err);
    }
});

window.editProject = editProject;
window.deleteProject = deleteProject;

loadProjects();