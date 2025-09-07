function openUploadModal() {
    document.getElementById('uploadModal').style.display = 'block';
}

function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
    document.getElementById('uploadForm').reset();
}

document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    const file = document.getElementById('contentFile').files[0];
    
    // Validate file size
    if (file.size > 50 * 1024 * 1024) { // 50MB
        alert('File size exceeds 50MB limit');
        return;
    }
    
    formData.append('title', document.getElementById('contentTitle').value);
    formData.append('type', document.getElementById('contentType').value);
    formData.append('description', document.getElementById('contentDescription').value);
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/content/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        if (data.success) {
            closeUploadModal();
            loadContent(); // Refresh content table
            showNotification('Content uploaded successfully', 'success');
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

function loadContent() {
    fetch('/api/content', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayContent(data.content);
        }
    })
    .catch(error => showNotification(error.message, 'error'));
}

function displayContent(content) {
    const tableBody = document.getElementById('contentTable');
    tableBody.innerHTML = content.map(item => `
        <tr>
            <td>${escapeHtml(item.title)}</td>
            <td>${escapeHtml(item.type)}</td>
            <td>${new Date(item.createdAt).toLocaleString()}</td>
            <td>${formatFileSize(item.size)}</td>
            <td>${item.views}</td>
            <td>
                <button class="action-btn btn-view" onclick="viewContent('${item._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn btn-edit" onclick="editContent('${item._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn btn-delete" onclick="deleteContent('${item._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

class Dashboard {
    constructor(contentManager) {
        this.contentManager = contentManager;
        this.setupEventListeners();
    }

    async initialize() {
        await this.loadDashboardData();
        this.updateDashboardCards();
    }

    setupEventListeners() {
        document.getElementById('uploadForm')?.addEventListener('submit', (e) => this.handleContentUpload(e));
        // ...existing event listeners...
    }

    async loadDashboardData() {
        try {
            await this.contentManager.loadContent();
            this.contentManager.displayAdminContent();
            this.loadUserManagementData();
            this.loadPaymentData();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    // ...existing dashboard methods...
}
