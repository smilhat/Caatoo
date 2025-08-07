// Tabs functionality
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Show corresponding content
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Calculate area when dimensions change
const lengthInput = document.getElementById('length');
const widthInput = document.getElementById('width');
const areaInput = document.getElementById('area');

function calculateArea() {
    const length = parseFloat(lengthInput.value) || 0;
    const width = parseFloat(widthInput.value) || 0;
    const area = length * width;
    areaInput.value = area.toFixed(2);
}

lengthInput.addEventListener('input', calculateArea);
widthInput.addEventListener('input', calculateArea);

// Calculate price when button is clicked
document.getElementById('calculate-btn').addEventListener('click', calculatePrice);

function calculatePrice() {
    // Get values
    const area = parseFloat(areaInput.value) || 0;
    const basePrice = parseFloat(document.getElementById('base-price-setting').value) || 10;
    const bodyAreaMultiplier = parseFloat(document.getElementById('body-area').value);
    const difficultyMultiplier = parseFloat(document.getElementById('difficulty').value);
    const colorMultiplier = parseFloat(document.getElementById('color').value);
    const hours = parseFloat(document.getElementById('hours').value) || 0;
    const minutes = parseFloat(document.getElementById('minutes').value) || 0;
    const hourlyRate = parseFloat(document.getElementById('hourly-price-setting').value) || 80;
    
    // Convert minutes to hours fraction
    const totalHours = hours + (minutes / 60);
    
    // Calculate price components
    const baseCost = area * basePrice;
    const bodyAreaCost = baseCost * bodyAreaMultiplier;
    const difficultyCost = baseCost * difficultyMultiplier;
    const colorCost = baseCost * colorMultiplier;
    const timeCost = totalHours * hourlyRate;
    
    // Total price (sum of all components)
    const totalPrice = baseCost + bodyAreaCost + difficultyCost + colorCost + timeCost;
    
    // Get currency symbol
    const currencySelect = document.getElementById('currency');
    const currencySymbol = currencySelect.options[currencySelect.selectedIndex].textContent.split(' - ')[1] || '$';
    
    // Get names of factors
    const bodyAreaName = document.getElementById('body-area').options[document.getElementById('body-area').selectedIndex].text.split(' (')[0];
    const difficultyName = document.getElementById('difficulty').options[document.getElementById('difficulty').selectedIndex].text.split(' (')[0];
    const colorName = document.getElementById('color').options[document.getElementById('color').selectedIndex].text.split(' (')[0];
    
    // Format time display
    const timeDisplay = `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    
    // Update UI
    document.querySelector('.result-price').textContent = `${currencySymbol}${totalPrice.toFixed(2)}`;
    
    // Update price breakdown
    const breakdownItems = document.querySelectorAll('.summary-item span:last-child');
    breakdownItems[0].textContent = `${currencySymbol}${baseCost.toFixed(2)}`;
    breakdownItems[1].textContent = `${currencySymbol}${bodyAreaCost.toFixed(2)}`;
    breakdownItems[2].textContent = `${currencySymbol}${difficultyCost.toFixed(2)}`;
    breakdownItems[3].textContent = `${currencySymbol}${colorCost.toFixed(2)}`;
    breakdownItems[4].textContent = `${currencySymbol}${timeCost.toFixed(2)}`;
    
    // Update breakdown labels
    breakdownItems[0].previousElementSibling.textContent = `Precio base (${area} cm² × ${currencySymbol}${basePrice.toFixed(2)}):`;
    breakdownItems[1].previousElementSibling.textContent = `Área corporal (${bodyAreaName}):`;
    breakdownItems[2].previousElementSibling.textContent = `Complejidad (${difficultyName}):`;
    breakdownItems[3].previousElementSibling.textContent = `Color (${colorName}):`;
    breakdownItems[4].previousElementSibling.textContent = `Tiempo (${timeDisplay} × ${currencySymbol}${hourlyRate.toFixed(2)}):`;
    
    document.querySelector('.summary-total span:last-child').textContent = `${currencySymbol}${totalPrice.toFixed(2)}`;
}

// Initialize the area calculation
calculateArea();

// Simulate a calculation on page load
setTimeout(calculatePrice, 1000);

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    
    // Reset classes
    toast.className = 'toast';
    
    // Add type class if specified
    if (type === 'error' || type === 'warning') {
        toast.classList.add(type);
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Configuration saving functionality
document.getElementById('save-prices-btn').addEventListener('click', () => {
    const basePrice = document.getElementById('base-price-setting').value;
    const hourlyPrice = document.getElementById('hourly-price-setting').value;
    
    // Update calculator display
    document.getElementById('hourly-rate').value = `$${hourlyPrice}`;
    
    // Add to history
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    
    const historyTable = document.querySelector('#price-history-table tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${dateStr}</td>
        <td>$${basePrice}</td>
        <td>$${hourlyPrice}</td>
        <td>Admin</td>
    `;
    historyTable.insertBefore(newRow, historyTable.firstChild);
    
    // Show success message
    showToast('Precios base guardados correctamente');
});

// Configuration management
const config = {
    areas: [
        { name: 'Brazo', percentage: 0.0 },
        { name: 'Espalda', percentage: 0.2 },
        { name: 'Costillas', percentage: 0.5 },
        { name: 'Pierna', percentage: 0.3 },
        { name: 'Pecho', percentage: 0.1 },
        { name: 'Hombro', percentage: -0.1 }
    ],
    difficulties: [
        { name: 'Básica', percentage: 0.0 },
        { name: 'Media', percentage: 0.3 },
        { name: 'Alta', percentage: 0.7 },
        { name: 'Muy alta', percentage: 1.0 }
    ],
    colors: [
        { name: 'Solo negro', percentage: 0.0 },
        { name: 'Negro y grises', percentage: 0.2 },
        { name: 'Color básico', percentage: 0.5 },
        { name: 'Color completo', percentage: 0.8 }
    ],
    currencies: [
        { code: 'USD', symbol: '$' },
        { code: 'EUR', symbol: '€' },
        { code: 'GBP', symbol: '£' }
    ]
};

// Populate existing items dropdowns
function populateExistingItems() {
    // Areas
    const areasSelect = document.getElementById('existing-areas');
    areasSelect.innerHTML = '<option value="">Seleccionar para editar/eliminar</option>';
    config.areas.forEach((area, index) => {
        const option = document.createElement('option');
        option.value = index;
        const percentage = Math.round(area.percentage * 100);
        option.textContent = `${area.name} (${percentage > 0 ? '+' : ''}${percentage}%)`;
        areasSelect.appendChild(option);
    });
    
    // Difficulties
    const difficultiesSelect = document.getElementById('existing-difficulties');
    difficultiesSelect.innerHTML = '<option value="">Seleccionar para editar/eliminar</option>';
    config.difficulties.forEach((difficulty, index) => {
        const option = document.createElement('option');
        option.value = index;
        const percentage = Math.round(difficulty.percentage * 100);
        option.textContent = `${difficulty.name} (${percentage > 0 ? '+' : ''}${percentage}%)`;
        difficultiesSelect.appendChild(option);
    });
    
    // Colors
    const colorsSelect = document.getElementById('existing-colors');
    colorsSelect.innerHTML = '<option value="">Seleccionar para editar/eliminar</option>';
    config.colors.forEach((color, index) => {
        const option = document.createElement('option');
        option.value = index;
        const percentage = Math.round(color.percentage * 100);
        option.textContent = `${color.name} (${percentage > 0 ? '+' : ''}${percentage}%)`;
        colorsSelect.appendChild(option);
    });
    
    // Currencies
    const currenciesSelect = document.getElementById('existing-currencies');
    currenciesSelect.innerHTML = '<option value="">Seleccionar para editar/eliminar</option>';
    config.currencies.forEach((currency, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${currency.code} (${currency.symbol})`;
        currenciesSelect.appendChild(option);
    });
}

// Initialize dropdowns
populateExistingItems();

// Area management
document.getElementById('save-area-btn').addEventListener('click', () => {
    const name = document.getElementById('area-name').value;
    const percentage = parseFloat(document.getElementById('area-percentage').value) / 100;
    
    if (!name || isNaN(percentage)) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    config.areas.push({ name, percentage });
    populateExistingItems();
    
    // Update calculator dropdown
    const bodyAreaSelect = document.getElementById('body-area');
    const newOption = document.createElement('option');
    newOption.value = percentage;
    const displayPercentage = Math.round(percentage * 100);
    newOption.textContent = `${name} (${displayPercentage > 0 ? '+' : ''}${displayPercentage}%)`;
    bodyAreaSelect.appendChild(newOption);
    
    // Clear form
    document.getElementById('area-name').value = '';
    document.getElementById('area-percentage').value = '';
    
    showToast('Área corporal guardada correctamente');
});

document.getElementById('edit-area-btn').addEventListener('click', () => {
    const index = document.getElementById('existing-areas').value;
    if (!index) return;
    
    const name = document.getElementById('area-name').value;
    const percentage = parseFloat(document.getElementById('area-percentage').value) / 100;
    
    if (!name || isNaN(percentage)) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    config.areas[index] = { name, percentage };
    populateExistingItems();
    
    // Update calculator dropdown
    const bodyAreaSelect = document.getElementById('body-area');
    const displayPercentage = Math.round(percentage * 100);
    bodyAreaSelect.options[parseInt(index) + 1].text = `${name} (${displayPercentage > 0 ? '+' : ''}${displayPercentage}%)`;
    
    showToast('Área corporal actualizada correctamente');
});

document.getElementById('delete-area-btn').addEventListener('click', () => {
    const index = document.getElementById('existing-areas').value;
    if (!index) return;
    
    const areaName = config.areas[index].name;
    
    if (confirm(`¿Estás seguro de eliminar el área "${areaName}"?`)) {
        config.areas.splice(index, 1);
        populateExistingItems();
        
        // Update calculator dropdown
        const bodyAreaSelect = document.getElementById('body-area');
        bodyAreaSelect.remove(parseInt(index) + 1);
        
        showToast(`Área "${areaName}" eliminada correctamente`);
    }
});

// Difficulty management
document.getElementById('save-difficulty-btn').addEventListener('click', () => {
    const name = document.getElementById('difficulty-name').value;
    const percentage = parseFloat(document.getElementById('difficulty-percentage').value) / 100;
    
    if (!name || isNaN(percentage)) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    config.difficulties.push({ name, percentage });
    populateExistingItems();
    
    // Update calculator dropdown
    const difficultySelect = document.getElementById('difficulty');
    const newOption = document.createElement('option');
    newOption.value = percentage;
    const displayPercentage = Math.round(percentage * 100);
    newOption.textContent = `${name} (${displayPercentage > 0 ? '+' : ''}${displayPercentage}%)`;
    difficultySelect.appendChild(newOption);
    
    // Clear form
    document.getElementById('difficulty-name').value = '';
    document.getElementById('difficulty-percentage').value = '';
    
    showToast('Nivel de dificultad guardado correctamente');
});

// Color management
document.getElementById('save-color-btn').addEventListener('click', () => {
    const name = document.getElementById('color-desc').value;
    const percentage = parseFloat(document.getElementById('color-percentage').value) / 100;
    
    if (!name || isNaN(percentage)) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    config.colors.push({ name, percentage });
    populateExistingItems();
    
    // Update calculator dropdown
    const colorSelect = document.getElementById('color');
    const newOption = document.createElement('option');
    newOption.value = percentage;
    const displayPercentage = Math.round(percentage * 100);
    newOption.textContent = `${name} (${displayPercentage > 0 ? '+' : ''}${displayPercentage}%)`;
    colorSelect.appendChild(newOption);
    
    // Clear form
    document.getElementById('color-desc').value = '';
    document.getElementById('color-percentage').value = '';
    
    showToast('Opción de color guardada correctamente');
});

// Currency management
document.getElementById('save-currency-btn').addEventListener('click', () => {
    const code = document.getElementById('currency-code').value;
    const symbol = document.getElementById('currency-symbol').value;
    
    if (!code || !symbol) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    config.currencies.push({ code, symbol });
    populateExistingItems();
    
    // Update calculator dropdown
    const currencySelect = document.getElementById('currency');
    const newOption = document.createElement('option');
    newOption.value = code;
    newOption.textContent = `${code} (${symbol}) - ${symbol}`;
    currencySelect.appendChild(newOption);
    
    // Clear form
    document.getElementById('currency-code').value = '';
    document.getElementById('currency-symbol').value = '';
    
    showToast('Moneda guardada correctamente');
});

// Event listeners for editing/deleting
document.querySelectorAll('#existing-areas, #existing-difficulties, #existing-colors, #existing-currencies').forEach(select => {
    select.addEventListener('change', function() {
        const index = this.value;
        if (index === "") return;
        
        let item;
        if (this.id === 'existing-areas') {
            item = config.areas[index];
            document.getElementById('area-name').value = item.name;
            document.getElementById('area-percentage').value = Math.round(item.percentage * 100);
        } else if (this.id === 'existing-difficulties') {
            item = config.difficulties[index];
            document.getElementById('difficulty-name').value = item.name;
            document.getElementById('difficulty-percentage').value = Math.round(item.percentage * 100);
        } else if (this.id === 'existing-colors') {
            item = config.colors[index];
            document.getElementById('color-desc').value = item.name;
            document.getElementById('color-percentage').value = Math.round(item.percentage * 100);
        } else if (this.id === 'existing-currencies') {
            item = config.currencies[index];
            document.getElementById('currency-code').value = item.code;
            document.getElementById('currency-symbol').value = item.symbol;
        }
    });
});

// Edit and delete for other categories
const manageCategory = (category, nameElement, percentageElement, selectId, calculatorSelectId, categoryName) => {
    document.getElementById(`edit-${category}-btn`).addEventListener('click', () => {
        const index = document.getElementById(selectId).value;
        if (!index) return;
        
        const name = document.getElementById(nameElement).value;
        const percentage = parseFloat(document.getElementById(percentageElement).value) / 100;
        
        if (!name || isNaN(percentage)) {
            showToast('Por favor completa todos los campos', 'error');
            return;
        }
        
        config[category][index] = { name, percentage };
        populateExistingItems();
        
        const calculatorSelect = document.getElementById(calculatorSelectId);
        const displayPercentage = Math.round(percentage * 100);
        calculatorSelect.options[parseInt(index) + 1].text = `${name} (${displayPercentage > 0 ? '+' : ''}${displayPercentage}%)`;
        
        showToast(`${categoryName} actualizado correctamente`);
    });
    
    document.getElementById(`delete-${category}-btn`).addEventListener('click', () => {
        const index = document.getElementById(selectId).value;
        if (!index) return;
        
        const itemName = config[category][index].name;
        
        if (confirm(`¿Estás seguro de eliminar "${itemName}"?`)) {
            config[category].splice(index, 1);
            populateExistingItems();
            
            const calculatorSelect = document.getElementById(calculatorSelectId);
            calculatorSelect.remove(parseInt(index) + 1);
            
            showToast(`"${itemName}" eliminado correctamente`);
        }
    });
};

// Set up management for each category
manageCategory('difficulties', 'difficulty-name', 'difficulty-percentage', 'existing-difficulties', 'difficulty', 'Nivel de dificultad');
manageCategory('colors', 'color-desc', 'color-percentage', 'existing-colors', 'color', 'Opción de color');

// Currency specific management
document.getElementById('edit-currency-btn').addEventListener('click', () => {
    const index = document.getElementById('existing-currencies').value;
    if (!index) return;
    
    const code = document.getElementById('currency-code').value;
    const symbol = document.getElementById('currency-symbol').value;
    
    if (!code || !symbol) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    config.currencies[index] = { code, symbol };
    populateExistingItems();
    
    const currencySelect = document.getElementById('currency');
    currencySelect.options[parseInt(index) + 1].text = `${code} (${symbol}) - ${symbol}`;
    
    showToast('Moneda actualizada correctamente');
});

document.getElementById('delete-currency-btn').addEventListener('click', () => {
    const index = document.getElementById('existing-currencies').value;
    if (!index) return;
    
    const currencyName = config.currencies[index].code;
    
    if (confirm(`¿Estás seguro de eliminar la moneda "${currencyName}"?`)) {
        config.currencies.splice(index, 1);
        populateExistingItems();
        
        const currencySelect = document.getElementById('currency');
        currencySelect.remove(parseInt(index) + 1);
        
        showToast(`Moneda "${currencyName}" eliminada correctamente`);
    }
});