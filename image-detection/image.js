import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@latest";

const fileUpload = document.getElementById('file-upload');
const imageContainer = document.getElementById('image-container');
const status = document.getElementById('status');

fileUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(e) {
        imageContainer.innerHTML = '';
        const image = document.createElement('img');
        image.src = e.target.result;
        image.onload = async () => {
            imageContainer.appendChild(image);
            status.textContent = 'Detecting...';
            try {
                const detector = await pipeline("object-detection", "Xenova/detr-resnet-50");
                await detect(image, detector);
                status.textContent = 'Detection completed.';
            } catch (error) {
                console.error('Error detecting image:', error);
                status.textContent = 'Error detecting image. Please try again.';
            }
        };
    };
    reader.readAsDataURL(file);
});

async function detect(img, detector) {
    const output = await detector(img.src, { threshold: 0.3, percentage: true });
    output.forEach(detection => renderBox(detection, img));
}

function renderBox({ box, label }, img) {
    const { xmax, xmin, ymax, ymin } = box;
    const color = "#" + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    const boxElement = document.createElement('div');
    boxElement.className = 'bounding-box';
    Object.assign(boxElement.style, {
        borderColor: color,
        position: 'absolute',
        left: `${xmin * img.width}px`,
        top: `${ymin * img.height}px`,
        width: `${(xmax - xmin) * img.width}px`,
        height: `${(ymax - ymin) * img.height}px`
    });
    const labelElement = document.createElement('span');
    labelElement.textContent = label;
    labelElement.className = "bounding-box-label";
    labelElement.style.background = color;
    boxElement.appendChild(labelElement);
    imageContainer.appendChild(boxElement);
}
