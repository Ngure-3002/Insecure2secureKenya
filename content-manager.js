class ContentManager {
    constructor() {
        this.content = JSON.parse(localStorage.getItem('siteContent') || '[]');
    }

    async loadContent() {
        try {
            const response = await fetch('/api/content', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                this.content = data.content;
                this.saveToStorage();
                return this.content;
            }
        } catch (error) {
            console.error('Error loading content:', error);
            return this.content;
        }
    }

    displayPublicContent() {
        const container = document.getElementById('resourcesContainer');
        if (!container) return;

        const activeContent = this.content.filter(item => item.status === 'active');
        
        container.innerHTML = activeContent.map(item => `
            <div class="resource-card ${item.type}-card">
                <div class="resource-icon">
                    <i class="${this.getIconForType(item.type)}"></i>
                </div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description)}</p>
                <button class="btn btn-primary" onclick="viewResource('${item._id}')">
                    View Resource
                </button>
            </div>
        `).join('');
    }

    displayAdminContent() {
        const table = document.getElementById('contentTable');
        if (!table) return;

        table.innerHTML = this.content.map(item => `
            <tr>
                <td>${escapeHtml(item.title)}</td>
                <td>${escapeHtml(item.type)}</td>
                <td>${new Date(item.createdAt).toLocaleString()}</td>
                <td>${this.formatFileSize(item.size)}</td>
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

    getIconForType(type) {
        const icons = {
            video: 'fas fa-video',
            pdf: 'fas fa-file-pdf',
            audio: 'fas fa-music',
            article: 'fas fa-file-alt'
        };
        return icons[type] || 'fas fa-file';
    }

    formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    saveToStorage() {
        localStorage.setItem('siteContent', JSON.stringify(this.content));
    }
}
