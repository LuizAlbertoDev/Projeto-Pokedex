const pokeApi = {}

function convertPokeApiDetailToPokemon(pokeDetail, speciesDetail = null, evolutionChain = null) {
    const pokemon = new Pokemon()
    pokemon.number = pokeDetail.id
    pokemon.name = pokeDetail.name
    pokemon.types = pokeDetail.types.map((slot) => slot.type.name)
    pokemon.type = pokemon.types[0]
    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default
    pokemon.height = pokeDetail.height
    pokemon.weight = pokeDetail.weight
    pokemon.abilities = pokeDetail.abilities.map((slot) => slot.ability.name)
    pokemon.stats = pokeDetail.stats.map((slot) => ({
        name: slot.stat.name,
        base_stat: slot.base_stat
    }))

    if (speciesDetail) {
        pokemon.species = speciesDetail.genera.find(g => g.language.name === 'en')?.genus || ""
        pokemon.eggGroups = speciesDetail.egg_groups.map(g => g.name)
        pokemon.eggCycle = speciesDetail.hatch_counter
        const female = (speciesDetail.gender_rate / 8) * 100
        pokemon.gender = speciesDetail.gender_rate === -1 ? "Genderless" : `♂ ${100 - female}% ♀ ${female}%`
    }

    if (evolutionChain) {
        pokemon.evolutions = evolutionChain
    }

    return pokemon
}


async function getPokemonPhoto(name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
    const data = await response.json()
    return data.sprites.other.dream_world.front_default || data.sprites.front_default
}

pokeApi.getPokemon = async (id) => {
    const pokeResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    const pokeDetail = await pokeResponse.json()
    
    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
    const speciesDetail = await speciesResponse.json()

    // Buscar Cadeia de Evolução
    const evoResponse = await fetch(speciesDetail.evolution_chain.url)
    const evoData = await evoResponse.json()

    // Percorrer a arvore de evolução e buscar fotos
    const evolutions = []
    let current = evoData.chain

    while (current) {
        const name = current.species.name
        const photo = await getPokemonPhoto(name)
        evolutions.push({ name, photo })
        current = current.evolves_to[0]
    }

    return convertPokeApiDetailToPokemon(pokeDetail, speciesDetail, evolutions)
}

pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url).then((res) => res.json()).then(convertPokeApiDetailToPokemon)
}

pokeApi.getPokemons = (offset = 0, limit = 5) => {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    return fetch(url).then((res) => res.json()).then((json) => json.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((requests) => Promise.all(requests))
}