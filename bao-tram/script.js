function candle() {
    var button = document.querySelector('button');

    var fire = document.querySelectorAll('.fire');

    if (button.innerText === 'Lighted the candles!') {
        for (var i = 0; i < fire.length; ++i) {
            fire[i].style.display = 'block';
        }
        button.innerHTML = 'Blow out the candles!';
    } else {
        for (var i = 0; i < fire.length; ++i) {
            fire[i].style.display = 'none';
        }
        var wave = document.querySelector('.waviy');
        wave.style.display = 'block';
        var card = document.querySelector('.birthdayCard');
        card.style.display = 'block';
        button.innerHTML = 'Lighted the candles!';
    }
}