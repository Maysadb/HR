import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- 1. إعداداتك (استبدليها ببيانات مشاريعك) ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    databaseURL: "YOUR_DB_URL",
    projectId: "YOUR_PROJECT_ID"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const employeesRef = ref(db, 'employees');

emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");

// --- 2. إرسال البيانات من الـ HR ---
const form = document.getElementById('employeeForm');
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
        employeeId: document.getElementById('employeeId').value,
        nationalId: document.getElementById('nationalId').value,
        fullNameAr: document.getElementById('fullNameAr').value,
        fullNameEn: document.getElementById('fullNameEn').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        department: document.getElementById('department').value,
        section: document.getElementById('section').value,
        jobPosition: document.getElementById('jobPosition').value,
        empType: document.getElementById('empType').value,
        joiningYear: document.getElementById('joiningYear').value,
        schoolEmail: document.getElementById('schoolEmail').value,
        status: "Pending"
    };

    push(employeesRef, data).then(() => {
        sendEmailNotification(data);
        alert("تم الإرسال وحفظ البيانات بنجاح!");
        form.reset();
    });
});

// --- 3. عرض البيانات للـ IT (Real-time) ---
onValue(employeesRef, (snapshot) => {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = "";
    snapshot.forEach((child) => {
        const id = child.key;
        const emp = child.val();
        const row = `
            <tr>
                <td>${emp.fullNameEn}</td>
                <td>${emp.employeeId}</td>
                <td>${emp.section}</td>
                <td><span class="status-badge ${emp.status === 'Pending' ? 'pending' : 'active'}">${emp.status}</span></td>
                <td>
                    <button onclick="updateStatus('${id}', 'Active')" style="color:green">تفعيل</button>
                    <button onclick="updateStatus('${id}', 'Disabled')" style="color:red">تعطيل</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
});

// --- 4. وظائف الإشعارات والتحكم ---
window.updateStatus = (id, newStatus) => {
    update(ref(db, `employees/${id}`), { status: newStatus });
};

function sendEmailNotification(emp) {
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        subject: "موظف جديد بانتظار الحساب: " + emp.fullNameEn,
        message: `الاسم: ${emp.fullNameAr}\nالقسم: ${emp.department}\nالرقم الوظيفي: ${emp.employeeId}`,
        to_email: "your-it-email@school.com"
    });
}
