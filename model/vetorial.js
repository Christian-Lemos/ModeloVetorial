const fs = require('fs')
let stopWords = new Array();

/**
 * Remove tudo que é lixo da string
 * @param {string} texto 
 * @returns {string} O texto processado/limpo
 */
function RemoverStopWords(texto)
{
    let processado = texto.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ' ').toLowerCase().replace(/\s\s+/g, ' ');
    let tmpArray = processado.split(' ')
    let retorno = ""
    for(let i = 0; i < tmpArray.length; i++)
    {
        let esta = false
        for(let j = 0; j < stopWords.length; j++)
        {   
            if(tmpArray[i] == stopWords[j])
            {
                esta = true
                break
            }
        }
        if(!esta)
            retorno += tmpArray[i] + ' '
    }
    return retorno.trim()
}
fs.readFile('./stopwords.txt', 'utf-8', (err, conteudo) => 
{
    if(err)
        throw err
    else
    {
        let palavras = conteudo.split('\n');
        for(let i = 0; i < palavras.length; i++)
        {
            palavras[i].replace(/\s/g, '')
        }
        stopWords = palavras
    }
})

module.exports = 
{
    RemoverStopWords : RemoverStopWords
}