var lowerSlider = document.querySelector('#lower'),
    upperSlider = document.querySelector('#upper'),
    rangeSlider = document.querySelector('.range-slider')
    range = document.querySelector(".range-selected"),
    range1 = document.querySelector(".range-selected1"),
    select = document.querySelector("#timeRange"),
    selectLabel = document.getElementById('selectType'),
    selectIcon = document.getElementById('selectTypeIcon'),
    rangeInputText1 = document.getElementById('rangeInputText1'),
    rangeInputText2 = document.getElementById('rangeInputText2')

lowerVal = parseInt(lowerSlider.value);
upperVal = parseInt(upperSlider.value);
maxRange = parseInt(lowerSlider.max) - parseInt(lowerSlider.min);
lowerSlider.style.cursor = 'no-drop';
upperSlider.style.cursor = 'no-drop';
lowerSlider.style.opacity = 0.4;
upperSlider.style.opacity = 0.4;
rangeSlider.style.opacity = 0.4;


function setRangeLabels() {
    if (lowerSlider.value < 10) {
        rangeInputText1.innerHTML = '0' + lowerSlider.value + 'h00';
    } else {
        rangeInputText1.innerHTML = lowerSlider.value + 'h00';
    }
    if (upperSlider.value < 10) {
        rangeInputText2.innerHTML = '0' + upperSlider.value + 'h00';
    } else {
        rangeInputText2.innerHTML = upperSlider.value + 'h00';
    }
};

function setSelectLabel(label) {
    selectLabel.innerHTML = label
};

select.oninput = function () {
    lowerSlider.value = 7;
    upperSlider.value = 21;
    if (select.value == 1) {
        range.style.left = (lowerSlider.value / maxRange) * 100 + '%';
        range.style.right = (1 - (upperSlider.value / maxRange)) * 100 + '%';
        range1.style.left = 100 + '%';
        range1.style.right = 100 + '%';
        range.style.background = 'gold';
        setRangeLabels();
        setSelectLabel('Diurno');
        selectIcon.innerHTML = '<i class="fa-solid fa-sun me-1"></i>';
        lowerSlider.disabled = true;
        upperSlider.disabled = true;
        lowerSlider.style.cursor = 'no-drop';
        upperSlider.style.cursor = 'no-drop';
        lowerSlider.style.opacity = 0.4;
        upperSlider.style.opacity = 0.4;
        rangeSlider.style.opacity = 0.4;

    } else if (select.value == 2) {
        range.style.left = 0 + '%';
        range.style.right = (1 - (lowerSlider.value / maxRange)) * 100 + '%';
        range1.style.left = (upperSlider.value / maxRange) * 100 - 1 + '%';
        range1.style.right = 0 + '%';
        range.style.background = '#1b53c0';
        setRangeLabels();
        setSelectLabel('Nocturno');
        selectIcon.innerHTML = '<i class="fa-solid fa-moon me-1"></i>';
        lowerSlider.disabled = true;
        upperSlider.disabled = true;
        lowerSlider.style.cursor = 'no-drop';
        upperSlider.style.cursor = 'no-drop';
        lowerSlider.style.opacity = 0.4;
        upperSlider.style.opacity = 0.4;
        rangeSlider.style.opacity = 0.4;
    } else if (select.value == 3) {
        lowerSlider.value = 0;
        upperSlider.value = 100;
        range.style.left = (lowerSlider.value / maxRange) * 100 + '%';
        range.style.right = (1 - (upperSlider.value / maxRange)) * 100 + '%';
        range1.style.left = 100 + '%';
        range1.style.right = 0 + '%';
        range.style.background = '#1b53c0';
        setRangeLabels();
        setSelectLabel('Personalizado');
        selectIcon.innerHTML = '<i class="fa-solid fa-user me-1"></i>';
        lowerSlider.disabled = false;
        upperSlider.disabled = false;
        lowerSlider.style.cursor = 'e-resize';
        upperSlider.style.cursor = 'e-resize';
        lowerSlider.style.opacity = 1;
        upperSlider.style.opacity = 1;
        rangeSlider.style.opacity = 1;
    } else {
        lowerSlider.value = 0;
        upperSlider.value = 100;
        range.style.left = 100 + '%';
        range.style.right = 0 + '%';
        range1.style.right = 100 + '%';
        range1.style.left = 0 + '%';
        setRangeLabels();
        setSelectLabel('--');
        selectIcon.innerHTML = '';
        lowerSlider.disabled = true;
        upperSlider.disabled = true;
        lowerSlider.style.cursor = 'no-drop';
        upperSlider.style.cursor = 'no-drop';
        lowerSlider.style.opacity = 0.4;
        upperSlider.style.opacity = 0.4;
        rangeSlider.style.opacity = 0.4;
    }
};

upperSlider.oninput = function () {
    lowerVal = parseInt(lowerSlider.value);
    upperVal = parseInt(upperSlider.value);

    if (upperVal < lowerVal + 1) {
        lowerSlider.value = upperVal - 1;
        if (lowerVal == lowerSlider.min) {
            upperSlider.value = 1;
        }
    }
    range.style.left = (lowerSlider.value / maxRange) * 100 + '%';
    range.style.right = (1 - (upperSlider.value / maxRange)) * 100 + '%';
    setRangeLabels()
};

lowerSlider.oninput = function () {
    lowerVal = parseInt(lowerSlider.value);
    upperVal = parseInt(upperSlider.value);

    if (lowerVal > upperVal - 1) {
        upperSlider.value = lowerVal + 1;
        if (upperVal == upperSlider.max) {
            lowerSlider.value = parseInt(upperSlider.max) - 1;
        }
    }
    range.style.left = (lowerSlider.value / maxRange) * 100 + '%';
    range.style.right = (1 - (upperSlider.value / maxRange)) * 100 + '%';
    setRangeLabels()
};