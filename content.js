console.log("Form Tool content script is running!");

// Thêm CSS cho các nút
const style = document.createElement("style");
style.innerHTML = ``;
document.head.appendChild(style);

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

// Hàm chờ đợi duy nhất
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

// Hàm chọn ngẫu nhiên câu trả lời cho mỗi câu hỏi
function randomizeQuestion(question) {
    const questionId = question.getAttribute("data-params") || "default";
    const options = question.querySelectorAll('[role="radio"], [role="checkbox"]');
    const input = question.querySelector("input[type='text'], textarea");

    if (options.length > 0) {
        const selectedOptions = [];
        const randomCount = Math.floor(Math.random() * options.length) + 1;
        const randomOptions = Array.from(options).sort(() => 0.5 - Math.random()).slice(0, randomCount);

        randomOptions.forEach((option) => {
            option.click();
            selectedOptions.push(option.getAttribute("aria-label") || "Option");
        });

        saveRandomData(questionId, selectedOptions.join(",")); // Lưu vào Session Storage
    } else if (input) {
        const randomText = "Random answer " + Math.floor(Math.random() * 1000);
        input.value = randomText;
        input.dispatchEvent(new Event("input"));
        saveRandomData(questionId, randomText); // Lưu vào Session Storage
    }
}


// Hàm thêm nút Randomize vào từng câu hỏi với hỗ trợ nhiều trang
function injectRandomizer() {
    restoreRandomData(); // Điền lại dữ liệu từ Session Storage

    const questionContainers = document.querySelectorAll("div[jsname='WsjYwc']");
    questionContainers.forEach((question) => {
        const existingRandomizeButton = question.querySelector(".custom-randomize-button");

        if (!existingRandomizeButton) {
            const randomizeButton = document.createElement("button");
            randomizeButton.type = "button";
            randomizeButton.textContent = "Randomize";
            randomizeButton.className = "custom-randomize-button";

            randomizeButton.style.position = "absolute";
            randomizeButton.style.top = "10px";
            randomizeButton.style.right = "10px";
            randomizeButton.style.padding = "5px 10px";
            randomizeButton.style.fontSize = "14px";
            randomizeButton.style.cursor = "pointer";
            randomizeButton.style.backgroundColor = "#007bff";
            randomizeButton.style.color = "white";
            randomizeButton.style.border = "none";
            randomizeButton.style.borderRadius = "4px";

            randomizeButton.onclick = () => randomizeQuestion(question);

            question.appendChild(randomizeButton);
        }
    });
}


function randomizeAnswers() {
    const randomDiv = document.querySelector("#borang-random-input-div");
    removeAllRandomInputs(); // Xóa dữ liệu ngẫu nhiên cũ

    const questionContainers = document.querySelectorAll("div[jsname='WsjYwc']");

    questionContainers.forEach((question) => {
        const questionId = question.getAttribute("data-params") || "default";
        const options = question.querySelectorAll('[role="radio"], [role="checkbox"]');
        const input = question.querySelector("input[type='text'], textarea");

        if (options.length > 0) {
            // Chọn một đáp án ngẫu nhiên
            const randomOption = Array.from(options).sort(() => 0.5 - Math.random())[0];
            randomOption.click(); // Tick vào đáp án ngẫu nhiên trên giao diện
            createRandomInput(questionId, randomOption.getAttribute("aria-label") || "Option");
        } else if (input) {
            // Điền giá trị ngẫu nhiên vào ô văn bản
            const randomText = "Random answer " + Math.floor(Math.random() * 1000);
            input.value = randomText;
            input.dispatchEvent(new Event("input")); // Gửi sự kiện để giao diện nhận diện
            createRandomInput(questionId, randomText);
        }
    });

    console.log("Answers randomized and marked as completed on UI.");
}


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




// Hàm thêm nút Randomize Page vào phía trên câu hỏi đầu tiên trên mỗi trang
function addRandomizePageButton() {
    const firstQuestionContainer = document.querySelector("div[jsmodel='CP1oW']");

    if (!firstQuestionContainer) return;

    let existingRandomizePageButton = document.querySelector(".randomize-page-button");
    if (!existingRandomizePageButton) {
        const randomizePageButton = document.createElement("button");
        randomizePageButton.type = "button";
        randomizePageButton.textContent = "Randomize Page";
        randomizePageButton.className = "borang-button randomize-page-button";
        randomizePageButton.style.marginBottom = "10px";

        randomizePageButton.onclick = () => {
            const questionContainers = document.querySelectorAll("div[jsname='WsjYwc']");
            questionContainers.forEach(randomizeQuestion); // Random hóa từng câu hỏi
            alert("All answers on this page have been randomized and saved!");
        };
        

        firstQuestionContainer.parentNode.insertBefore(randomizePageButton, firstQuestionContainer);
    }
}



// Gửi form nhiều lần theo yêu cầu
async function submitForm(actionURL, times) {
    for (let i = 0; i < times; i++) {
        try {
            randomizeAnswers(); // Ngẫu nhiên hóa và đánh dấu đáp án trên giao diện

            const formData = new FormData(document.querySelector("form"));
            const randomDiv = document.querySelector("#borang-random-input-div");

            // Thêm dữ liệu ngẫu nhiên từ div ẩn vào formData
            Array.from(randomDiv.querySelectorAll("input")).forEach((input) => {
                formData.set(input.name, input.value);
            });

            const response = await fetch(actionURL, { method: "POST", body: formData });
            console.log(`Form submitted: ${i + 1}/${times}`, response.status);
        } catch (error) {
            console.error("Submit error:", error);
        }
        await wait(500); // Đợi 500ms giữa mỗi lần gửi
    }

    alert(`Đã hoàn thành: ${times} lần.`);
}




function generateRandomAnswers() {
    const randomAnswers = {};
    const questionContainers = document.querySelectorAll("div[jsname='WsjYwc']");

    questionContainers.forEach((question) => {
        const questionId = question.getAttribute("data-params") || "default";
        const options = question.querySelectorAll('[role="radio"], [role="checkbox"]');
        const input = question.querySelector("input[type='text'], textarea");

        if (options.length > 0) {
            const randomOption = Array.from(options).sort(() => 0.5 - Math.random())[0];
            randomAnswers[questionId] = randomOption.getAttribute("aria-label") || "Option";
        } else if (input) {
            randomAnswers[questionId] = "Random answer " + Math.floor(Math.random() * 1000);
        }
    });

    return randomAnswers;
}



// Hàm thêm nút Submit và Randomize Page vào form Google
async function injectGoogleForm() {
    const form = await waitForElement("form");
    const submitButtonContainer = await waitForElement(".DE3NNc.CekdCb");
    const submitButton = await waitForElement(".uArJ5e.UQuaGc.Y5sE8d.VkkpIf.QvWxOd");

    if (form && submitButtonContainer && submitButton) {
        console.log("Form and submit button container found for Google Forms");

        const customButton = document.createElement("button");
        customButton.type = "button";
        customButton.textContent = "Submit";
        customButton.className = "custom-button";
        customButton.style.marginLeft = "8px";

        customButton.onclick = async () => {
            console.log("Custom Submit button clicked on Google Form");
            const count = +prompt("Bạn muốn gửi bao nhiều lần?");
            if (!count) return alert("Vui lòng nhập định dạng số");
            await submitForm(form.action, count);
        };

        submitButtonContainer.insertBefore(customButton, submitButton.nextSibling);

        addRandomizePageButton(); // Thêm nút Randomize Page
    } else {
        console.log("Submit button container or form not found on Google Forms");
    }
}


// Thay đổi nút Gửi gốc thành nút Submit của Extension
async function replaceOriginalSubmitButton() {
    const originalSubmitButton = document.querySelector("div[role='button'][jsname='M2UYVd']"); // Tìm nút gửi mặc định

    if (originalSubmitButton) {
        console.log("Original submit button found, replacing it...");

        // Tạo nút "Submit" mới
        const customButton = document.createElement("button");
        customButton.type = "button";
        customButton.textContent = "Submit";
        customButton.className = "custom-button";
        customButton.style.marginLeft = "8px";

        // Gán sự kiện click cho nút "Submit" mới
        customButton.addEventListener("click", async (event) => {
            event.preventDefault(); // Ngăn chặn hành vi mặc định
            console.log("Custom Submit button clicked on Google Form");
            const form = document.querySelector("form"); // Tìm form để lấy dữ liệu
            const count = +prompt("How many times should the form be submitted?");
            if (!count) return alert("Please enter a number.");
            await submitForm(form.action, count); // Gọi hàm submitForm với số lần yêu cầu
        });

        // Thay thế nút "Gửi" bằng nút "Submit"
        originalSubmitButton.parentNode.replaceChild(customButton, originalSubmitButton);
    } else {
        console.error("Original submit button not found");
    }
}

// Hàm quan sát thay đổi DOM
function observeDOMChanges() {
    const observer = new MutationObserver(() => {
        console.log("DOM changes detected, attempting to replace submit button...");
        replaceOriginalSubmitButton(); // Thay thế nút "Gửi" mỗi khi có thay đổi DOM
    });

    // Theo dõi toàn bộ tài liệu
    observer.observe(document.body, { childList: true, subtree: true });
}

// Gọi hàm quan sát DOM ngay khi script chạy
observeDOMChanges();








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


// Hàm lưu dữ liệu ngẫu nhiên vào sessionStorage
function saveRandomData(questionId, value) {
    let randomData = JSON.parse(sessionStorage.getItem("randomData")) || {};
    randomData[questionId] = value;
    sessionStorage.setItem("randomData", JSON.stringify(randomData));
}

// Hàm khôi phục dữ liệu ngẫu nhiên từ sessionStorage
function restoreRandomData() {
    let randomData = JSON.parse(sessionStorage.getItem("randomData")) || {};
    const questionContainers = document.querySelectorAll("div[jsname='WsjYwc']");

    questionContainers.forEach((question) => {
        const questionId = question.getAttribute("data-params") || "default";
        const savedValue = randomData[questionId];
        
        if (savedValue) {
            const options = question.querySelectorAll('[role="radio"], [role="checkbox"]');
            const input = question.querySelector("input[type='text'], textarea");

            if (options.length > 0) {
                options.forEach((option) => {
                    if (savedValue.includes(option.getAttribute("aria-label"))) {
                        option.click(); // Chọn lại các đáp án đã lưu
                    }
                });
            } else if (input) {
                input.value = savedValue; // Điền lại giá trị văn bản đã lưu
                input.dispatchEvent(new Event("input"));
            }
        }
    });
}




// Khởi tạo hệ thống randomizer
function initializeRandomizerSystem() {
    observePageChanges(); // Theo dõi thay đổi trang
    addRandomizePageButton(); // Thêm nút Randomize Page vào trang đầu tiên
    injectRandomizer(); // Thêm nút Randomize cho từng câu hỏi ngay từ đầu
}

// Bắt đầu hệ thống randomizer
initializeRandomizerSystem();

// Khởi tạo các chức năng
(async () => {
    injectRandomInputDiv(); 
    await injectGoogleForm();
    injectRandomizer();
    injectRandomInputDiv();
})();

