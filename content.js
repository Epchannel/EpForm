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

// Hàm thêm nút Randomize vào từng câu hỏi với hỗ trợ nhiều trang
function injectRandomizer() {
    const questionContainers = document.querySelectorAll("div[jsname='WsjYwc']"); // Chọn tất cả câu hỏi

    questionContainers.forEach((question) => {
        const existingRandomizeButton = question.querySelector(".custom-randomize-button");

        // Chỉ thêm nút Randomize nếu chưa có
        if (!existingRandomizeButton) {
            const randomizeButton = document.createElement("button");
            randomizeButton.type = "button";
            randomizeButton.textContent = "Randomize";
            randomizeButton.className = "custom-randomize-button";

            // Thêm nút vào container tổng của câu hỏi
            question.style.position = "relative"; // Đảm bảo container chính có thể chứa nút căn chỉnh
            randomizeButton.style.position = "absolute";
            randomizeButton.style.top = "10px"; // Căn chỉnh vị trí theo chiều dọc
            randomizeButton.style.right = "10px"; // Căn sát lề phải
            randomizeButton.style.padding = "5px 10px";
            randomizeButton.style.fontSize = "14px";
            randomizeButton.style.cursor = "pointer";
            randomizeButton.style.backgroundColor = "#007bff";
            randomizeButton.style.color = "white";
            randomizeButton.style.border = "none";
            randomizeButton.style.borderRadius = "4px";

            // Gán sự kiện click để randomize câu hỏi
            randomizeButton.onclick = () => randomizeQuestion(question);

            // Thêm nút vào container của câu hỏi
            question.appendChild(randomizeButton);
        }
    });
}



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
    alert(`Đã hoàn thành: ${times} lần.`);
}

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
            const count = +prompt("Bạn muốn gửi bao nhiều lần?");
            if (!count) return alert("Vui lòng nhập định dạng số");
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
    await injectGoogleForm();
    injectRandomizer();
    injectRandomInputDiv();
})();


