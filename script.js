// Variables globales para la configuración de la aplicación
let config = {
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
        { name: 'Amarillo', percentage: 0.05 },
        { name: 'Rojo', percentage: 0.05 },
        { name: 'Azul', percentage: 0.05 },
        { name: 'Blanco', percentage: 0.05 }
    ],
    currencies: [
        { code: 'USD', symbol: '$' },
        { code: 'EUR', symbol: '€' },
        { code: 'GBP', symbol: '£' }
    ],
    basePrices: {
        basePrice: 10,
        hourlyPrice: 1000
    },
    priceHistory: []
};

// Variable para almacenar el usuario actual
let currentUser = null;

// Sistema de notificaciones toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.className = 'toast';
    
    if (type === 'error') {
        toast.classList.add('error');
    } else if (type === 'warning') {
        toast.classList.add('warning');
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Función para manejar el inicio de sesión con Google
function handleGoogleSignIn(response) {
    // Decodificar el JWT para obtener la información del usuario
    const userData = parseJwt(response.credential);
    
    // Guardar información del usuario
    currentUser = {
        id: userData.sub,
        name: userData.name,
        email: userData.email,
        picture: userData.picture
    };
    
    // Actualizar la UI
    updateUserUI();
    
    // Cargar la configuración del usuario
    loadConfig();
    
    showToast(`Bienvenido, ${userData.name}`);
}

// Función para analizar el JWT
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

// Función para cerrar sesión
function handleSignOut() {
    currentUser = null;
    
    // Actualizar la UI
    updateUserUI();
    
    // Restablecer a la configuración por defecto
    resetToDefaultConfig();
    
    showToast('Sesión cerrada correctamente');
}

// Actualizar la UI según el estado de autenticación
function updateUserUI() {
    const googleLoginContainer = document.getElementById('google-login-container');
    const userInfo = document.getElementById('user-info');
    const loginPrompt = document.getElementById('login-prompt');
    const calculatorContent = document.getElementById('calculator-content');
    const configLoginPrompt = document.getElementById('config-login-prompt');
    const configContent = document.getElementById('config-content');
    
    if (currentUser) {
        // Usuario autenticado
        googleLoginContainer.style.display = 'none';
        userInfo.style.display = 'flex';
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-avatar').src = currentUser.picture;
        
        // Mostrar contenido de la aplicación
        loginPrompt.style.display = 'none';
        calculatorContent.style.display = 'block';
        configLoginPrompt.style.display = 'none';
        configContent.style.display = 'block';
    } else {
        // Usuario no autenticado
        googleLoginContainer.style.display = 'block';
        userInfo.style.display = 'none';
        
        // Mostrar mensajes de inicio de sesión
        loginPrompt.style.display = 'block';
        calculatorContent.style.display = 'none';
        configLoginPrompt.style.display = 'block';
        configContent.style.display = 'none';
    }
}

// Cargar configuración desde localStorage (vinculada al usuario)
function loadConfig() {
    if (!currentUser) {
        resetToDefaultConfig();
        return;
    }
    
    const userKey = `catooConfig_${currentUser.id}`;
    const savedConfig = localStorage.getItem(userKey);
    
    if (savedConfig) {
        try {
            const parsedConfig = JSON.parse(savedConfig);
            // Combinar configuración guardada con la configuración predeterminada
            config = {...config, ...parsedConfig};
            
            // Actualizar UI con la configuración cargada
            document.getElementById('base-price-setting').value = config.basePrices.basePrice;
            document.getElementById('hourly-price-setting').value = config.basePrices.hourlyPrice;
            
            // Actualizar símbolos de moneda
            updateCurrencySymbols();
            document.getElementById('hourly-rate').value = `${config.currencies[0]?.symbol || '$'}${config.basePrices.hourlyPrice.toFixed(2)}`;
            
            // Poblar dropdowns
            populateExistingItems();
            updateCalculatorDropdowns();
            
            // Calcular precio con valores cargados
            setTimeout(calculatePrice, 100);
        } catch (e) {
            console.error("Error loading config:", e);
            showToast("Error al cargar la configuración", "error");
        }
    } else {
        // Configuración predeterminada para el usuario nuevo
        populateExistingItems();
        updateCalculatorDropdowns();
    }
}

// Guardar configuración en localStorage (vinculada al usuario)
function saveConfig() {
    if (!currentUser) {
        showToast("Debes iniciar sesión para guardar la configuración", "error");
        return false;
    }
    
    try {
        const userKey = `catooConfig_${currentUser.id}`;
        localStorage.setItem(userKey, JSON.stringify(config));
        return true;
    } catch (e) {
        console.error("Error saving config:", e);
        showToast("Error al guardar la configuración", "error");
        return false;
    }
}

// Restablecer a la configuración por defecto
function resetToDefaultConfig() {
    config = {
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
            { name: 'Amarillo', percentage: 0.05 },
            { name: 'Rojo', percentage: 0.05 },
            { name: 'Azul', percentage: 0.05 },
            { name: 'Blanco', percentage: 0.05 }
        ],
        currencies: [
            { code: 'USD', symbol: '$' },
            { code: 'EUR', symbol: '€' },
            { code: 'GBP', symbol: '£' }
        ],
        basePrices: {
            basePrice: 10,
            hourlyPrice: 1000
        },
        priceHistory: []
    };
    
    populateExistingItems();
    updateCalculatorDropdowns();
    calculatePrice();
}

// Actualizar símbolos de moneda en la UI
function updateCurrencySymbols() {
    const symbol = config.currencies[0]?.symbol || '$';
    document.getElementById('base-currency-symbol').textContent = symbol;
    document.getElementById('hourly-currency-symbol').textContent = symbol;
}

// Poblar dropdowns de elementos existentes
function populateExistingItems() {
    // Áreas
    const areasSelect = document.getElementById('existing-areas');
    areasSelect.innerHTML = '<option value="">Seleccionar para editar/eliminar</option>';
    config.areas.forEach((area, index) => {
        const option = document.createElement('option');
        option.value = index;
        const percentage = Math.round(area.percentage * 100);
        option.textContent = `${area.name} (${percentage > 0 ? '+' : ''}${percentage}%)`;
        areasSelect.appendChild(option);
    });
    
    // Dificultades
    const difficultiesSelect = document.getElementById('existing-difficulties');
    difficultiesSelect.innerHTML = '<option value="">Seleccionar para editar/eliminar</option>';
    config.difficulties.forEach((difficulty, index) => {
        const option = document.createElement('option');
        option.value = index;
        const percentage = Math.round(difficulty.percentage * 100);
        option.textContent = `${difficulty.name} (${percentage > 0 ? '+' : ''}${percentage}%)`;
        difficultiesSelect.appendChild(option);
    });
    
    // Colores
    const colorsSelect = document.getElementById('existing-colors');
    colorsSelect.innerHTML = '<option value="">Seleccionar para editar/eliminar</option>';
    config.colors.forEach((color, index) => {
        const option = document.createElement('option');
        option.value = index;
        const percentage = Math.round(color.percentage * 100);
        option.textContent = `${color.name} (${percentage > 0 ? '+' : ''}${percentage}%)`;
        colorsSelect.appendChild(option);
    });
    
    // Monedas
    const currenciesSelect = document.getElementById('existing-currencies');
    currenciesSelect.innerHTML = '<option value="">Seleccionar para editar/eliminar</option>';
    config.currencies.forEach((currency, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${currency.code} (${currency.symbol})`;
        currenciesSelect.appendChild(option);
    });
    
    // Historial de precios
    updatePriceHistory();
}

// Actualizar tabla de historial de precios
function updatePriceHistory() {
    const historyTable = document.querySelector('#price-history-table tbody');
    historyTable.innerHTML = '';
    
    config.priceHistory.forEach(entry => {
        const row = document.createElement('tr');
        const symbol = config.currencies[0]?.symbol || '$';
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${symbol}${entry.basePrice.toFixed(2)}</td>
            <td>${symbol}${entry.hourlyPrice.toFixed(2)}</td>
            <td>${entry.updatedBy}</td>
        `;
        historyTable.appendChild(row);
    });
}

// Actualizar dropdowns de la calculadora con la configuración actual
function updateCalculatorDropdowns() {
    // Actualizar dropdown de áreas
    const bodyAreaSelect = document.getElementById('body-area');
    bodyAreaSelect.innerHTML = '';
    config.areas.forEach(area => {
        const option = document.createElement('option');
        option.value = area.percentage;
        const percentage = Math.round(area.percentage * 100);
        option.textContent = `${area.name} (${percentage > 0 ? '+' : ''}${percentage}%)`;
        bodyAreaSelect.appendChild(option);
    });
    
    // Actualizar dropdown de dificultades
    const difficultySelect = document.getElementById('difficulty');
    difficultySelect.innerHTML = '';
    config.difficulties.forEach(difficulty => {
        const option = document.createElement('option');
        option.value = difficulty.percentage;
        const percentage = Math.round(difficulty.percentage * 100);
        option.textContent = `${difficulty.name} (${percentage > 0 ? '+' : ''}${percentage}%)`;
        difficultySelect.appendChild(option);
    });
    
    // Actualizar dropdown de colores
    const colorSelect = document.getElementById('color');
    colorSelect.innerHTML = '';
    config.colors.forEach(color => {
        const option = document.createElement('option');
        option.value = color.percentage;
        const percentage = Math.round(color.percentage * 100);
        option.textContent = `${color.name} (${percentage > 0 ? '+' : ''}${percentage}%)`;
        colorSelect.appendChild(option);
    });
    
    // Actualizar dropdown de monedas
    const currencySelect = document.getElementById('currency');
    currencySelect.innerHTML = '';
    config.currencies.forEach(currency => {
        const option = document.createElement('option');
        option.value = currency.code;
        option.setAttribute('data-symbol', currency.symbol);
        option.textContent = `${currency.code} (${currency.symbol})`;
        currencySelect.appendChild(option);
    });
    
    // Seleccionar la primera opción por defecto en cada dropdown
    if (bodyAreaSelect.options.length > 0) bodyAreaSelect.selectedIndex = 0;
    if (difficultySelect.options.length > 0) difficultySelect.selectedIndex = 0;
    if (colorSelect.options.length > 0) colorSelect.selectedIndex = 0;
    if (currencySelect.options.length > 0) currencySelect.selectedIndex = 0;
}

// Calcular área cuando cambian las dimensiones
function calculateArea() {
    const lengthInput = document.getElementById('length');
    const widthInput = document.getElementById('width');
    const areaInput = document.getElementById('area');
    
    const length = parseFloat(lengthInput.value) || 0;
    const width = parseFloat(widthInput.value) || 0;
    const area = length * width;
    areaInput.value = area.toFixed(2);
    calculatePrice();
}

// Calcular precio
function calculatePrice() {
    // Obtener valores
    const areaInput = document.getElementById('area');
    const area = parseFloat(areaInput.value) || 0;
    const basePrice = parseFloat(document.getElementById('base-price-setting').value) || 10;
    const bodyAreaSelect = document.getElementById('body-area');
    const difficultySelect = document.getElementById('difficulty');
    const colorSelect = document.getElementById('color');
    
    const bodyAreaMultiplier = parseFloat(bodyAreaSelect.value) || 0;
    const difficultyMultiplier = parseFloat(difficultySelect.value) || 0;
    const colorMultiplier = parseFloat(colorSelect.value) || 0;
    
    const hours = parseFloat(document.getElementById('hours').value) || 0;
    const minutes = parseFloat(document.getElementById('minutes').value) || 0;
    const hourlyRate = parseFloat(document.getElementById('hourly-price-setting').value) || 1000;
    
    // Convertir minutos a fracción de horas
    const totalHours = hours + (minutes / 60);
    
    // Calcular componentes del precio
    const baseCost = area * basePrice;
    const bodyAreaCost = baseCost * bodyAreaMultiplier;
    const difficultyCost = baseCost * difficultyMultiplier;
    const colorCost = baseCost * colorMultiplier;
    const timeCost = totalHours * hourlyRate;
    
    // Precio total (suma de todos los componentes)
    const totalPrice = baseCost + bodyAreaCost + difficultyCost + colorCost + timeCost;
    
    // Obtener símbolo de moneda
    const currencySelect = document.getElementById('currency');
    const selectedCurrency = currencySelect.options[currencySelect.selectedIndex];
    const currencySymbol = selectedCurrency.getAttribute('data-symbol') || '$';
    
    // Obtener nombres de los factores
    const bodyAreaName = bodyAreaSelect.options[bodyAreaSelect.selectedIndex].text.split(' (')[0];
    const difficultyName = difficultySelect.options[difficultySelect.selectedIndex].text.split(' (')[0];
    const colorName = colorSelect.options[colorSelect.selectedIndex].text.split(' (')[0];
    
    // Formatear visualización del tiempo
    const timeDisplay = `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    
    // Actualizar UI
    document.getElementById('result-price').textContent = `${currencySymbol}${totalPrice.toFixed(2)}`;
    
    // Actualizar desglose de precios
    document.getElementById('base-cost').textContent = `${currencySymbol}${baseCost.toFixed(2)}`;
    document.getElementById('area-cost').textContent = `${currencySymbol}${bodyAreaCost.toFixed(2)}`;
    document.getElementById('difficulty-cost').textContent = `${currencySymbol}${difficultyCost.toFixed(2)}`;
    document.getElementById('color-cost').textContent = `${currencySymbol}${colorCost.toFixed(2)}`;
    document.getElementById('time-cost').textContent = `${currencySymbol}${timeCost.toFixed(2)}`;
    document.getElementById('total-cost').textContent = `${currencySymbol}${totalPrice.toFixed(2)}`;
    
    // Actualizar etiquetas del desglose
    document.getElementById('base-cost-label').textContent = `Precio base (${area} cm² × ${currencySymbol}${basePrice.toFixed(2)}):`;
    document.getElementById('area-cost-label').textContent = `Dificultad del área (${bodyAreaName}):`;
    document.getElementById('difficulty-cost-label').textContent = `Dificultad del diseño (${difficultyName}):`;
    document.getElementById('color-cost-label').textContent = `Color (${colorName}):`;
    document.getElementById('time-cost-label').textContent = `Tiempo (${timeDisplay} × ${currencySymbol}${hourlyRate.toFixed(2)}):`;
}

// Funcionalidad para guardar configuración
function savePrices() {
    const basePrice = parseFloat(document.getElementById('base-price-setting').value);
    const hourlyPrice = parseFloat(document.getElementById('hourly-price-setting').value);
    
    if (isNaN(basePrice) || isNaN(hourlyPrice) || basePrice <= 0 || hourlyPrice <= 0) {
        showToast('Por favor ingresa valores válidos para los precios', 'error');
        return;
    }
    
    // Actualizar configuración
    config.basePrices.basePrice = basePrice;
    config.basePrices.hourlyPrice = hourlyPrice;
    
    // Añadir al historial
    const now = new Date();
    config.priceHistory.unshift({
        date: now.toLocaleDateString(),
        basePrice: basePrice,
        hourlyPrice: hourlyPrice,
        updatedBy: currentUser ? currentUser.name : 'Anónimo'
    });
    
    // Mantener solo las últimas 10 entradas del historial
    if (config.priceHistory.length > 10) {
        config.priceHistory = config.priceHistory.slice(0, 10);
    }
    
    // Actualizar visualización en la calculadora
    const symbol = config.currencies[0]?.symbol || '$';
    document.getElementById('hourly-rate').value = `${symbol}${hourlyPrice.toFixed(2)}`;
    updateCurrencySymbols();
    
    // Guardar configuración y actualizar UI
    if (saveConfig()) {
        updatePriceHistory();
        calculatePrice();
        showToast('Precios base guardados correctamente');
    }
}

// Gestión de áreas
function saveArea() {
    const name = document.getElementById('area-name').value.trim();
    const percentage = parseFloat(document.getElementById('area-percentage').value) / 100;
    
    if (!name || isNaN(percentage)) {
        showToast('Por favor completa todos los campos correctamente', 'error');
        return;
    }
    
    config.areas.push({ name, percentage });
    
    // Guardar configuración y actualizar UI
    if (saveConfig()) {
        populateExistingItems();
        updateCalculatorDropdowns();
        
        // Limpiar formulario
        document.getElementById('area-name').value = '';
        document.getElementById('area-percentage').value = '';
        
        showToast('Dificultad del área guardada correctamente');
    }
}

function editArea() {
    const index = document.getElementById('existing-areas').value;
    if (index === "" || !index) {
        showToast('Por favor selecciona un área para editar', 'error');
        return;
    }
    
    const name = document.getElementById('area-name').value.trim();
    const percentage = parseFloat(document.getElementById('area-percentage').value) / 100;
    
    if (!name || isNaN(percentage)) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    config.areas[index] = { name, percentage };
    
    // Guardar configuración y actualizar UI
    if (saveConfig()) {
        populateExistingItems();
        updateCalculatorDropdowns();
        showToast('Dificultad del área actualizada correctamente');
    }
}

function deleteArea() {
    const index = document.getElementById('existing-areas').value;
    if (index === "" || !index) {
        showToast('Por favor selecciona un área para eliminar', 'error');
        return;
    }
    
    const areaName = config.areas[index].name;
    
    if (confirm(`¿Estás seguro de eliminar la dificultad de área "${areaName}"?`)) {
        config.areas.splice(index, 1);
        
        // Guardar configuración y actualizar UI
        if (saveConfig()) {
            populateExistingItems();
            updateCalculatorDropdowns();
            showToast(`Dificultad del área "${areaName}" eliminada correctamente`);
        }
    }
}

// Gestión de dificultades
function saveDifficulty() {
    const name = document.getElementById('difficulty-name').value.trim();
    const percentage = parseFloat(document.getElementById('difficulty-percentage').value) / 100;
    
    if (!name || isNaN(percentage)) {
        showToast('Por favor completa todos los campos correctamente', 'error');
        return;
    }
    
    config.difficulties.push({ name, percentage });
    
    // Guardar configuración y actualizar UI
    if (saveConfig()) {
        populateExistingItems();
        updateCalculatorDropdowns();
        
        // Limpiar formulario
        document.getElementById('difficulty-name').value = '';
        document.getElementById('difficulty-percentage').value = '';
        
        showToast('Dificultad del diseño guardada correctamente');
    }
}

function editDifficulty() {
    const index = document.getElementById('existing-difficulties').value;
    if (index === "" || !index) {
        showToast('Por favor selecciona un nivel para editar', 'error');
        return;
    }
    
    const name = document.getElementById('difficulty-name').value.trim();
    const percentage = parseFloat(document.getElementById('difficulty-percentage').value) / 100;
    
    if (!name || isNaN(percentage)) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    config.difficulties[index] = { name, percentage };
    
    // Guardar configuración y actualizar UI
    if (saveConfig()) {
        populateExistingItems();
        updateCalculatorDropdowns();
        showToast('Dificultad del diseño actualizada correctamente');
    }
}

function deleteDifficulty() {
    const index = document.getElementById('existing-difficulties').value;
    if (index === "" || !index) {
        showToast('Por favor selecciona un nivel para eliminar', 'error');
        return;
    }
    
    const difficultyName = config.difficulties[index].name;
    
    if (confirm(`¿Estás seguro de eliminar la dificultad "${difficultyName}"?`)) {
        config.difficulties.splice(index, 1);
        
        // Guardar configuración y actualizar UI
        if (saveConfig()) {
            populateExistingItems();
            updateCalculatorDropdowns();
            showToast(`Dificultad "${difficultyName}" eliminada correctamente`);
        }
    }
}

// Gestión de colores
function saveColor() {
    const name = document.getElementById('color-desc').value.trim();
    const percentage = parseFloat(document.getElementById('color-percentage').value) / 100;
    
    if (!name || isNaN(percentage)) {
        showToast('Por favor completa todos los campos correctamente', 'error');
        return;
    }
    
    config.colors.push({ name, percentage });
    
    // Guardar configuración y actualizar UI
    if (saveConfig()) {
        populateExistingItems();
        updateCalculatorDropdowns();
        
        // Limpiar formulario
        document.getElementById('color-desc').value = '';
        document.getElementById('color-percentage').value = '';
        
        showToast('Opción de color guardada correctamente');
    }
}

function editColor() {
    const index = document.getElementById('existing-colors').value;
    if (index === "" || !index) {
        showToast('Por favor selecciona una opción para editar', 'error');
        return;
    }
    
    const name = document.getElementById('color-desc').value.trim();
    const percentage = parseFloat(document.getElementById('color-percentage').value) / 100;
    
    if (!name || isNaN(percentage)) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    config.colors[index] = { name, percentage };
    
    // Guardar configuración y actualizar UI
    if (saveConfig()) {
        populateExistingItems();
        updateCalculatorDropdowns();
        showToast('Opción de color actualizada correctamente');
    }
}

function deleteColor() {
    const index = document.getElementById('existing-colors').value;
    if (index === "" || !index) {
        showToast('Por favor selecciona una opción para eliminar', 'error');
        return;
    }
    
    const colorName = config.colors[index].name;
    
    if (confirm(`¿Estás seguro de eliminar la opción "${colorName}"?`)) {
        config.colors.splice(index, 1);
        
        // Guardar configuración y actualizar UI
        if (saveConfig()) {
            populateExistingItems();
            updateCalculatorDropdowns();
            showToast(`Opción "${colorName}" eliminada correctamente`);
        }
    }
}

// Gestión de monedas
function saveCurrency() {
    const code = document.getElementById('currency-code').value.trim().toUpperCase();
    const symbol = document.getElementById('currency-symbol').value.trim();
    
    if (!code || !symbol) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    // Verificar si la moneda ya existe
    if (config.currencies.some(c => c.code === code)) {
        showToast('Esta moneda ya existe', 'error');
        return;
    }
    
    config.currencies.push({ code, symbol });
    
    // Guardar configuración y actualizar UI
    if (saveConfig()) {
        populateExistingItems();
        updateCalculatorDropdowns();
        updateCurrencySymbols();
        
        // Limpiar formulario
        document.getElementById('currency-code').value = '';
        document.getElementById('currency-symbol').value = '';
        
        showToast('Moneda guardada correctamente');
    }
}

function editCurrency() {
    const index = document.getElementById('existing-currencies').value;
    if (index === "" || !index) {
        showToast('Por favor selecciona una moneda para editar', 'error');
        return;
    }
    
    const code = document.getElementById('currency-code').value.trim().toUpperCase();
    const symbol = document.getElementById('currency-symbol').value.trim();
    
    if (!code || !symbol) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    config.currencies[index] = { code, symbol };
    
    // Guardar configuración y actualizar UI
    if (saveConfig()) {
        populateExistingItems();
        updateCalculatorDropdowns();
        updateCurrencySymbols();
        showToast('Moneda actualizada correctamente');
    }
}

function deleteCurrency() {
    const index = document.getElementById('existing-currencies').value;
    if (index === "" || !index) {
        showToast('Por favor selecciona una moneda para eliminar', 'error');
        return;
    }
    
    const currencyName = config.currencies[index].code;
    
    // Prevenir eliminar todas las monedas
    if (config.currencies.length <= 1) {
        showToast('Debe haber al menos una moneda configurada', 'error');
        return;
    }
    
    if (confirm(`¿Estás seguro de eliminar la moneda "${currencyName}"?`)) {
        config.currencies.splice(index, 1);
        
        // Guardar configuración y actualizar UI
        if (saveConfig()) {
            populateExistingItems();
            updateCalculatorDropdowns();
            updateCurrencySymbols();
            showToast(`Moneda "${currencyName}" eliminada correctamente`);
        }
    }
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Configurar event listeners para elementos existentes
    const lengthInput = document.getElementById('length');
    const widthInput = document.getElementById('width');
    
    lengthInput.addEventListener('input', calculateArea);
    widthInput.addEventListener('input', calculateArea);
    
    document.getElementById('calculate-btn').addEventListener('click', calculatePrice);
    
    // Calcular precio cuando cambian otros parámetros
    document.querySelectorAll('#body-area, #difficulty, #color, #hours, #minutes').forEach(element => {
        element.addEventListener('change', calculatePrice);
    });
    
    // Funcionalidad de pestañas
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Botones de configuración
    document.getElementById('save-prices-btn').addEventListener('click', savePrices);
    document.getElementById('save-area-btn').addEventListener('click', saveArea);
    document.getElementById('edit-area-btn').addEventListener('click', editArea);
    document.getElementById('delete-area-btn').addEventListener('click', deleteArea);
    document.getElementById('save-difficulty-btn').addEventListener('click', saveDifficulty);
    document.getElementById('edit-difficulty-btn').addEventListener('click', editDifficulty);
    document.getElementById('delete-difficulty-btn').addEventListener('click', deleteDifficulty);
    document.getElementById('save-color-btn').addEventListener('click', saveColor);
    document.getElementById('edit-color-btn').addEventListener('click', editColor);
    document.getElementById('delete-color-btn').addEventListener('click', deleteColor);
    document.getElementById('save-currency-btn').addEventListener('click', saveCurrency);
    document.getElementById('edit-currency-btn').addEventListener('click', editCurrency);
    document.getElementById('delete-currency-btn').addEventListener('click', deleteCurrency);
    
    // Event listeners para dropdowns de edición
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
    
    // Botón de cerrar sesión
    document.getElementById('sign-out-button').addEventListener('click', handleSignOut);
    
    // Inicializar la UI de usuario
    updateUserUI();
    
    // Añadir entrada inicial al historial de precios si está vacío
    if (config.priceHistory.length === 0) {
        config.priceHistory.push({
            date: new Date().toLocaleDateString(),
            basePrice: config.basePrices.basePrice,
            hourlyPrice: config.basePrices.hourlyPrice,
            updatedBy: 'Sistema'
        });
    }
    
    // Cálculo inicial
    calculateArea();
});
