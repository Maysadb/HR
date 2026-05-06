import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 1. إعدادات Firebase الخاصة بكِ (ضعي بياناتك هنا)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const employeesRef = ref(db, 'employees');

// 2. إعداد EmailJS (لإرسال إيميل لكِ فوراً)
emailjs.init("YOUR_PUBLIC_KEY"); 

const employeeForm = document.getElementById('employeeForm');
const tableBody = document.getElementById('tableBody');

// --- وظيفة HR: إضافة موظف جديد ---
employeeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('fullName').value;
    const dept = document.getElementById('department').value;

    push(employeesRef, {
        name: name,
        department: dept,
        status: "Pending",
        date: new Date().toLocaleDateString()
    }).then(() => {
        // إرسال إشعار لبريدك
        sendEmailNotification(name, dept);
        alert("تم إرسال الطلب لقسم IT");
        employeeForm.reset();
    });
});

// --- وظيفة IT: تحديث الجدول تلقائياً ---
onValue(employeesRef, (snapshot) => {
    tableBody.innerHTML = "";
    snapshot.forEach((child) => {
        const id = child.key;
        const val = child.val();
        
        const row = `
            <tr>
                <td><strong>${val.name}</strong></td>
                <td>${val.department}</td>
                <td><span class="status-badge ${val.status.toLowerCase()}">${val.status}</span></td>
                <td>
                    ${val.status === 'Pending' ? `<button class="btn-create" onclick="updateStatus('${id}', 'Active')">إنشاء الإيميل</button>` : ''}
                    <button class="btn-disable" onclick="updateStatus('${id}', 'Disabled')">Disable</button>
                    <button style="background:#64748b" onclick="deleteRecord('${id}')">حذف</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
});

// --- وظائف التحكم ---
window.updateStatus = (id, newStatus) => {
    update(ref(db, `employees/${id}`), { status: newStatus });
    if(newStatus === 'Active') alert("تم تحديث الحالة لـ Active");
};

window.deleteRecord = (id) => {
    if(confirm("هل تريد حذف السجل نهائياً؟")) {
        remove(ref(db, `employees/${id}`));
    }
};

function sendEmailNotification(name, dept) {
    // كود إرسال إيميل بسيط عبر EmailJS
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        to_name: "Maysa",
        from_name: "IT System",
        message: `يوجد موظف جديد: ${name} في قسم ${dept}. يرجى تجهيز الحساب.`
    });
}
