const students = JSON.parse(localStorage.getItem('students')) || [];
const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
const fees = JSON.parse(localStorage.getItem('fees')) || [];
const docs = JSON.parse(localStorage.getItem('docs')) || [];
let studentSortOrder = 'name';

const state = {
    students,
    rooms,
    fees,
    docs,
    sort: 'name'
};

const toastEl = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');

function saveState() {
    localStorage.setItem('students', JSON.stringify(state.students));
    localStorage.setItem('rooms', JSON.stringify(state.rooms));
    localStorage.setItem('fees', JSON.stringify(state.fees));
    localStorage.setItem('docs', JSON.stringify(state.docs));
}

function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastEl.timeout);
    toastEl.timeout = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('nav button').forEach(btn => btn.classList.toggle('active', btn.dataset.page === id));
}

function updateNavigation() {
    document.querySelectorAll('nav button').forEach(button => {
        button.addEventListener('click', () => showPage(button.dataset.page));
    });
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function renderActivity(message) {
    const activity = document.getElementById('recentActivity');
    const item = document.createElement('li');
    item.textContent = message;
    activity.prepend(item);
    if (activity.children.length > 5) {
        activity.removeChild(activity.lastChild);
    }
}

function renderStudents() {
    const table = document.getElementById('studentTable');
    const filter = document.getElementById('search').value.toLowerCase();
    const list = state.students
        .slice()
        .sort((a, b) => a[state.sort].localeCompare(b[state.sort]))
        .filter(student => student.name.toLowerCase().includes(filter) || student.roll.toLowerCase().includes(filter) || student.course.toLowerCase().includes(filter));

    table.innerHTML = '';
    list.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.roll}</td>
            <td>${student.course}</td>
            <td><button type="button" class="danger" onclick="deleteStudent(${index})">Delete</button></td>`;
        table.appendChild(row);
    });

    document.getElementById('totalStudents').innerText = state.students.length;
    document.getElementById('totalStudentsMini').innerText = state.students.length;
}

function deleteStudent(index) {
    const student = state.students.splice(index, 1)[0];
    saveState();
    renderStudents();
    toast(`Removed ${student.name}`);
}

function searchStudent() {
    const searchValue = document.getElementById('globalSearch').value || document.getElementById('search').value;
    document.getElementById('search').value = searchValue;
    renderStudents();
}

function sortStudents(criteria) {
    state.sort = criteria;
    renderStudents();
}

function renderRooms() {
    const table = document.getElementById('roomTable');
    table.innerHTML = '';
    state.rooms.forEach((room, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${room.name}</td>
            <td>${room.room}</td>
            <td><button type="button" class="danger" onclick="deleteRoom(${index})">Release</button></td>`;
        table.appendChild(row);
    });
    document.getElementById('roomsUsed').innerText = state.rooms.length;
}

function deleteRoom(index) {
    const room = state.rooms.splice(index, 1)[0];
    saveState();
    renderRooms();
    toast(`Freed room ${room.room}`);
}

function renderFees() {
    const table = document.getElementById('feeTable');
    table.innerHTML = '';
    let pendingCount = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let totalAmount = 0;

    state.fees.forEach((fee, index) => {
        const status = fee.remaining > 0 ? 'Pending' : 'Paid';
        if (status === 'Pending') pendingCount += 1;
        totalPaid += fee.paid;
        totalDue += fee.remaining;
        totalAmount += fee.total;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fee.name}</td>
            <td>${formatCurrency(fee.total)}</td>
            <td>${formatCurrency(fee.paid)}</td>
            <td>${formatCurrency(fee.remaining)}</td>
            <td><span class="status-pill ${status === 'Paid' ? 'status-paid' : 'status-pending'}">${status}</span></td>
            <td><button type="button" class="danger" onclick="deleteFee(${index})">Delete</button></td>`;
        table.appendChild(row);
    });

    document.getElementById('pendingFees').innerText = pendingCount;
    document.getElementById('totalPaid').innerText = formatCurrency(totalPaid);
    document.getElementById('totalDue').innerText = formatCurrency(totalDue);
    const progress = totalAmount ? Math.min(100, Math.round((totalPaid / totalAmount) * 100)) : 0;
    document.getElementById('feeProgress').style.width = `${progress}%`;
}

function deleteFee(index) {
    const fee = state.fees.splice(index, 1)[0];
    saveState();
    renderFees();
    toast(`Removed fee record for ${fee.name}`);
}

function renderDocs() {
    const list = document.getElementById('docList');
    list.innerHTML = '';
    state.docs.forEach((doc, index) => {
        const item = document.createElement('li');
        item.innerHTML = `<span>${doc}</span><button type="button" onclick="deleteDoc(${index})">Delete</button>`;
        list.appendChild(item);
    });
}

function deleteDoc(index) {
    const name = state.docs.splice(index, 1)[0];
    saveState();
    renderDocs();
    toast(`Removed ${name}`);
}

function uploadDoc() {
    const file = document.getElementById('docUpload').files[0];
    if (!file) {
        toast('Select a file first');
        return;
    }

    state.docs.push(file.name);
    saveState();
    renderDocs();
    toast(`Uploaded ${file.name}`);
    document.getElementById('docUpload').value = '';
}

function initTheme() {
    const stored = localStorage.getItem('hms-theme');
    if (stored === 'dark') {
        document.body.classList.add('dark');
        themeToggle.textContent = 'Light mode';
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
    localStorage.setItem('hms-theme', isDark ? 'dark' : 'light');
}

function attachEvents() {
    updateNavigation();
    themeToggle.addEventListener('click', toggleTheme);
    document.getElementById('studentForm').addEventListener('submit', event => {
        event.preventDefault();
        const nameInput = document.getElementById('name');
        const rollInput = document.getElementById('roll');
        const courseInput = document.getElementById('course');
        const student = {
            name: nameInput.value.trim(),
            roll: rollInput.value.trim(),
            course: courseInput.value.trim()
        };
        if (!student.name || !student.roll || !student.course) return;
        state.students.push(student);
        saveState();
        renderStudents();
        renderActivity(`New student added: ${student.name}`);
        toast('Student added successfully');
        nameInput.value = '';
        rollInput.value = '';
        courseInput.value = '';
    });

    document.getElementById('roomForm').addEventListener('submit', event => {
        event.preventDefault();
        const studentRoom = document.getElementById('studentRoom');
        const roomNo = document.getElementById('roomNo');
        const room = { name: studentRoom.value.trim(), room: roomNo.value.trim() };
        if (!room.name || !room.room) return;
        state.rooms.push(room);
        saveState();
        renderRooms();
        renderActivity(`Room allocated to ${room.name}`);
        toast('Room allocated');
        studentRoom.value = '';
        roomNo.value = '';
    });

    document.getElementById('feeForm').addEventListener('submit', event => {
        event.preventDefault();
        const feeName = document.getElementById('feeName');
        const totalFee = Number(document.getElementById('totalFee').value);
        const paidFee = Number(document.getElementById('paidFee').value);
        if (!feeName.value.trim() || totalFee < 0 || paidFee < 0) return;
        const fee = {
            name: feeName.value.trim(),
            total: totalFee,
            paid: paidFee,
            remaining: Math.max(0, totalFee - paidFee)
        };
        state.fees.push(fee);
        saveState();
        renderFees();
        renderActivity(`Fee record created for ${fee.name}`);
        toast('Fee record added');
        feeName.value = '';
        document.getElementById('totalFee').value = '';
        document.getElementById('paidFee').value = '';
    });
}

function init() {
    initTheme();
    attachEvents();
    renderStudents();
    renderRooms();
    renderFees();
    renderDocs();
}

init();