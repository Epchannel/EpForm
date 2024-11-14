console.log("Form Tool content script is running!");

// Thêm CSS cho các nút
const style = document.createElement("style");
style.innerHTML = `
    .custom-button {
        background-color: #1a73e8;
        color: white;
        border: none;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        margin-left: 8px;
        border-radius: 4px;
    }
    .custom-button:hover {
        background-color: #185abc;
    }
    .custom-randomize-button {
        width: fit-content;
        height: fit-content;
        padding: 10px;
        border: 1px solid white;
        border-radius: 5px;
        background-color: black;
        color: white;
    }
    .custom-randomize-button:hover {
        background-color: #185abc;
    }
    .borang-button {
        background-color: #1a73e8;
        color: white;
        border: none;
        padding: 10px;
        font-size: 14px;
        cursor: pointer;
        margin: 10px;
        border-radius: 4px;
    }
    .borang-button:hover {
        background-color: #185abc;
    }
`;
document.head.appendChild(style);

// Hàm thêm nút Submit và Randomize Page vào form Google
async function injectGoogleForm() {
    const form = await waitForElement("form");
    const submitButtonContainer = await waitForElement(".DE3NNc.CekdCb");
    const submitButton = await waitForElement(".uArJ5e.UQuaGc.Y5sE8d.VkkpIf.QvWxOd");

    if (form && submitButtonContainer && submitButton) {
        console.log("Form and submit button container found for Google Forms");

        // Tạo nút Submit mới
        const customButton = document.createElement("button");
        customButton.type = "button";
        customButton.textContent = "Submit";
        customButton.className = "custom-button";
        customButton.style.marginLeft = "8px";

        // Thêm nút ngay sau nút Gửi gốc
        submitButtonContainer.insertBefore(customButton, submitButton.nextSibling);

        // Đặt sự kiện click cho nút Submit mới
        customButton.onclick = async () => {
            console.log("Custom Submit button clicked on Google Form");
            const count = +prompt("How many times should the form be submitted?");
            if (!count) return alert("Please enter a number.");
            await submitForm(form.action, count);
        };

        // Thêm nút Randomize Page
        addRandomizePageButton();
    } else {
        console.log("Submit button container or form not found on Google Forms");
    }
}

// Thay đổi nút Gửi gốc thành nút Submit của Extension
async function replaceOriginalSubmitButton() {
    const originalSubmitButton = await waitForElement(".uArJ5e.UQuaGc.Y5sE8d.VkkpIf"); // Tìm nút Gửi gốc
    
    if (originalSubmitButton) {
        const buttonText = originalSubmitButton.querySelector(".NPEfkd.RveJvd.snByac");
        if (buttonText && buttonText.textContent === "Gửi") {
            buttonText.textContent = "Submit"; // Thay đổi văn bản thành "Submit"

            // Thêm sự kiện click để thực hiện hành động submit của Extension
            originalSubmitButton.onclick = async (event) => {
                event.preventDefault(); // Ngăn chặn hành vi submit mặc định
                console.log("Custom Submit button clicked on Google Form");
                const form = document.querySelector("form"); // Tìm form để lấy dữ liệu
                const count = +prompt("How many times should the form be submitted?"); // Hỏi số lần submit
                if (!count) return alert("Please enter a number.");
                await submitForm(form.action, count); // Gọi hàm submitForm với số lần yêu cầu
            };
        }
    } else {
        console.log("Original submit button not found");
    }
}



// Gửi form nhiều lần theo yêu cầu
async function submitForm(actionURL, times) {
    const formData = new FormData(document.querySelector("form"));
    for (let i = 0; i < times; i++) {
        try {
            const response = await fetch(actionURL, { method: "POST", body: formData });
            console.log(`Form submitted: ${i + 1}/${times}`, response.status);
        } catch (error) {
            console.error("Submit error:", error);
        }
        await wait(500); // Đợi 500ms giữa mỗi lần submit
    }
    alert(`${times} submissions completed.`);
}


// Hàm chờ đợi duy nhất
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Chờ trang tải xong và thay đổi nút Gửi thành Submit
document.addEventListener("DOMContentLoaded", replaceOriginalSubmitButton);




// Hàm thêm nút Randomize Page vào phía trên câu hỏi đầu tiên trên mỗi trang
function addRandomizePageButton() {
    const firstQuestionContainer = document.querySelector("div[jsmodel='CP1oW']"); // Chọn phần tử của câu hỏi đầu tiên

    // Nếu không tìm thấy câu hỏi đầu tiên trên trang hiện tại thì dừng
    if (!firstQuestionContainer) return;

    // Kiểm tra nếu nút Randomize Page chưa được thêm vào trang
    let existingRandomizePageButton = document.querySelector(".randomize-page-button");
    if (!existingRandomizePageButton) {
        const randomizePageButton = document.createElement("button");
        randomizePageButton.type = "button";
        randomizePageButton.textContent = "Randomize Page";
        randomizePageButton.className = "borang-button randomize-page-button";
        randomizePageButton.style.marginBottom = "10px";

        // Sự kiện click để randomize toàn bộ câu hỏi trên trang
        randomizePageButton.onclick = () => {
            randomizePageButton.classList.toggle("randomize");

            if (randomizePageButton.classList.contains("randomize")) {
                randomizePageButton.style.backgroundColor = "green";

                // Gọi hàm randomize cho từng câu hỏi trên trang và làm mờ các nút randomize của từng câu hỏi
                document.querySelectorAll(".custom-randomize-button").forEach(async (button) => {
                    await randomizeQuestion(button.closest("div[jsmodel='CP1oW']")); // Ngẫu nhiên cho từng câu hỏi
                    button.style.opacity = "0.5"; // Làm mờ nút randomize
                    button.disabled = true; // Vô hiệu hóa nút randomize
                });
            } else {
                randomizePageButton.style.backgroundColor = "";
                removeAllRandomInputs();

                // Khôi phục trạng thái cho các nút Randomize của từng câu hỏi
                document.querySelectorAll(".custom-randomize-button").forEach((button) => {
                    button.style.opacity = "1"; // Khôi phục độ mờ
                    button.disabled = false; // Bật lại nút randomize
                });
            }
        };

        // Thêm nút Randomize Page vào phía trên câu hỏi đầu tiên
        firstQuestionContainer.parentNode.insertBefore(randomizePageButton, firstQuestionContainer);
    }
}

// Hàm thêm nút Randomize vào từng câu hỏi với hỗ trợ nhiều trang
function injectRandomizer() {
    const questionContainers = document.querySelectorAll("div[jsmodel='CP1oW']"); // Chọn tất cả câu hỏi trên trang hiện tại

    // Duyệt qua tất cả các câu hỏi được phát hiện
    questionContainers.forEach((question) => {
        const questionId = question.getAttribute("data-params") || "default";
        const existingRandomizeButton = question.querySelector(".custom-randomize-button");

        // Chỉ thêm nút Randomize nếu chưa có
        if (!existingRandomizeButton) {
            const randomizeButton = document.createElement("button");
            randomizeButton.type = "button";
            randomizeButton.textContent = "Randomize";
            randomizeButton.className = "custom-randomize-button";
            randomizeButton.style.marginTop = "8px";

            // Sự kiện click để chọn ngẫu nhiên cho câu hỏi
            randomizeButton.onclick = () => randomizeQuestion(question);

            // Thêm nút vào mỗi câu hỏi
            question.appendChild(randomizeButton);
        }
    });
}


// Quan sát sự thay đổi của các trang để thêm nút Randomize Page khi người dùng chuyển trang
function observePageChanges() {
    const observer = new MutationObserver(() => {
        addRandomizePageButton(); // Thêm nút Randomize Page khi trang thay đổi
        injectRandomizer(); // Thêm nút Randomize cho từng câu hỏi mới

        // Làm mờ các nút Randomize nếu Randomize Page đang bật
        const isRandomizeActive = document.querySelector(".randomize-page-button.randomize");
        if (isRandomizeActive) {
            document.querySelectorAll(".custom-randomize-button").forEach((button) => {
                button.style.opacity = "0.5"; // Làm mờ nút randomize
                button.disabled = true; // Vô hiệu hóa nút randomize
            });
        }
    });

    // Theo dõi toàn bộ tài liệu để phát hiện thay đổi khi chuyển trang
    observer.observe(document, { childList: true, subtree: true });
}

// Khởi tạo hệ thống randomizer
function initializeRandomizerSystem() {
    observePageChanges(); // Theo dõi thay đổi trang
    addRandomizePageButton(); // Thêm nút Randomize Page vào trang đầu tiên
    injectRandomizer(); // Thêm nút Randomize cho từng câu hỏi ngay từ đầu
}

// Bắt đầu hệ thống randomizer
initializeRandomizerSystem();


// Hàm chọn ngẫu nhiên câu trả lời cho mỗi câu hỏi
function randomizeQuestion(question) {
    console.log("Randomizing question:", question);

    const questionId = question.getAttribute("data-params") || "default";
    const options = question.querySelectorAll('[role="radio"], [role="checkbox"]');

    if (options.length > 0) {
        const selectedOptions = [];
        const randomCount = Math.floor(Math.random() * options.length) + 1;
        const randomOptions = Array.from(options).sort(() => 0.5 - Math.random()).slice(0, randomCount);

        randomOptions.forEach((option) => {
            option.click();
            selectedOptions.push(option.getAttribute("aria-label") || "Option");
        });

        createRandomInput(questionId, selectedOptions.join(","));
    } else {
        const input = question.querySelector("input[type='text'], textarea");
        if (input) {
            const randomText = "Random answer " + Math.floor(Math.random() * 1000);
            input.value = randomText;
            input.dispatchEvent(new Event("input"));
            createRandomInput(questionId, randomText);
        }
    }
}

// Các hàm hỗ trợ cho lưu trữ dữ liệu random
function injectRandomInputDiv() {
    const randomDiv = document.createElement("div");
    randomDiv.id = "borang-random-input-div";
    randomDiv.style.display = "none";
    document.documentElement.appendChild(randomDiv);
}

function createRandomInput(questionId, value) {
    const randomDiv = document.querySelector("#borang-random-input-div");
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = questionId;
    input.value = value;
    randomDiv.appendChild(input);
}

function removeAllRandomInputs() {
    const randomDiv = document.querySelector("#borang-random-input-div");
    while (randomDiv.firstChild) {
        randomDiv.removeChild(randomDiv.firstChild);
    }
}

// Hàm hỗ trợ chờ đợi phần tử xuất hiện
function waitForElement(selector) {
    return new Promise((resolve) => {
        const element = document.querySelector(selector);
        if (element) {
            console.log(`Element found immediately: ${selector}`);
            return resolve(element);
        }
        console.log(`Waiting for element to appear: ${selector}`);

        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`Element appeared: ${selector}`);
                obs.disconnect();
                resolve(element);
            }
        });
        observer.observe(document, { childList: true, subtree: true });
    });
}

// Khởi tạo các chức năng
(async () => {
    await injectGoogleForm();
    injectRandomizer();
    injectRandomInputDiv();
})();


