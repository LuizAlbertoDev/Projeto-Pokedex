function convertPokemonToDetailHtml(pokemon) {
    const statsHtml = pokemon.stats.map((s) => `
        <div class="stat-row">
            <span class="label-stat">${s.name.replace('special-', 'Sp. ')}</span>
            <span class="value-stat">${s.base_stat}</span>
            <div class="bar-container"><div class="bar-fill ${pokemon.type}" style="width: ${s.base_stat}%"></div></div>
        </div>
    `).join('')

    const evolutionHtml = pokemon.evolutions.map((evo) => `
        <div class="evo-item">
            <img src="${evo.photo}" alt="${evo.name}">
            <p style="text-transform: capitalize; font-weight: bold;">${evo.name}</p>
        </div>
    `).join('<span class="evo-arrow">➜</span>')

    return `
    <section class="pokemon-detail-page ${pokemon.type}">
        <div class="header">
            <div class="nav"><a href="index.html" class="back-button">←</a></div>
            <div class="pokemon-identity">
                <h1 class="name">${pokemon.name}</h1>
                <span class="number">#${String(pokemon.number).padStart(3, '0')}</span>
            </div>
            <ol class="types">${pokemon.types.map((t) => `<li class="type ${t}">${t}</li>`).join('')}</ol>
        </div>

        <img class="pokemon-image" src="${pokemon.photo}" alt="${pokemon.name}">

        <div class="details-card">
            <ul class="tabs">
                <li id="tab-about" class="tab-item active" onclick="openTab('about')">Sobre</li>
                <li id="tab-stats" class="tab-item" onclick="openTab('stats')">Estatísticas básicas</li>
                <li id="tab-evo" class="tab-item" onclick="openTab('evo')">Evolução</li>
            </ul>

            <div id="content-about" class="tab-content active">
                <div class="info-grid">
                    <span class="label">Espécie</span> <span class="value">${pokemon.species}</span>
                    <span class="label">Altura</span> <span class="value">${pokemon.height / 10} m</span>
                    <span class="label">Peso</span> <span class="value">${pokemon.weight / 10} kg</span>
                    <span class="label">Habilidades</span> <span class="value" style="text-transform: capitalize;">${pokemon.abilities.join(', ')}</span>
                </div>
            </div>

            <div id="content-stats" class="tab-content">
                <div class="stats-container">${statsHtml}</div>
            </div>

            <div id="content-evo" class="tab-content">
                <div class="evo-container">${evolutionHtml}</div>
            </div>
        </div>
    </section>
    `
}

function openTab(tabName) {
    document.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.getElementById(`content-${tabName}`).classList.add('active');
}

(function loadPokemonDetail() {
    const urlParams = new URLSearchParams(window.location.search)
    const pokemonId = urlParams.get('id')
    const content = document.getElementById('pokemonDetailContent')
    if (!pokemonId) return window.location.href = 'index.html';

    pokeApi.getPokemon(pokemonId).then((pokemon) => {
        content.innerHTML = convertPokemonToDetailHtml(pokemon)
        document.body.className = pokemon.type
    })
})()