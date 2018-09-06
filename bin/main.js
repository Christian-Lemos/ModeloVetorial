
/**
 * @typedef ConteudoArquivos
 * @description Objeto contendo nome do documento e conteudo
 * @property {string} nome O nome do documento
 * @property {string} conteudo O conteúdo do documento
 */

const readline = require('readline')
const fs = require('fs')
const yargs = require('yargs').argv
const vetorial = require('./../model/vetorial')
const HashMap = require('hashmap')


var diretorio = (yargs.dir) ? yargs.dir : "./docs"


/**
 * @param nomeDiretorio O diretorio que se deseja ler
 * @returns {Promise<Array.<ConteudoArquivos>>} nomeDiretorio 
 */
function lerDiretorio(diretorio)
{
    return new Promise((resolve, reject) => {
        fs.readdir(diretorio, (err, nomeArquivos) => {
            if(err)
                reject(err)
            else
            {
                let arrayPromessas = new Array();
                nomeArquivos.forEach((arquivo) => {
                    arrayPromessas.push(new Promise((resolve, reject) => {
                        let nomeArquivo = arquivo;
                        fs.readFile(diretorio + "/" + arquivo, 'utf-8', (err, conteudo) => {
                            if(err)
                                reject(err)
                            else
                                resolve({nome : nomeArquivo, conteudo : conteudo})
                        })
                    }))
                })
                Promise.all(arrayPromessas).then(resultado =>
                    resolve(resultado)
                )
                .catch((err) => reject(err))
            }
        })
    })
}


function getHashMapPalavras(arrayPalavras)
{
    let hashPalavras = {}
    for(let j = 0; j < arrayPalavras.length; j++)
    {
        let quantidadePalavra = hashPalavras[arrayPalavras[j]];
        
        if(typeof(quantidadePalavra) == 'undefined')
            hashPalavras[arrayPalavras[j]] = 1
        else
            hashPalavras[arrayPalavras[j]] = quantidadePalavra + 1
    }
    return hashPalavras
}


lerDiretorio(diretorio).then((resultado) =>
{
    /**
     * @type {Array.<ConteudoArquivos>}
     */
    resultado
    let palavrasSoma = {}
    let hashDocumentosPalavras = {}

    for(let i = 0; i < resultado.length; i++)
    {
        
        resultado[i].conteudo =  vetorial.RemoverStopWords(resultado[i].conteudo)
        let palavrasConteudo = resultado[i].conteudo.split(' ');

        let hashPalavras = {}
        for(let j = 0; j < palavrasConteudo.length; j++)
        {
            let quantidadePalavra = hashPalavras[palavrasConteudo[j]];
            
            if(typeof(quantidadePalavra) == 'undefined')
                hashPalavras[palavrasConteudo[j]] = 1
            else
                hashPalavras[palavrasConteudo[j]] = quantidadePalavra + 1

            let palavra = palavrasSoma[palavrasConteudo[j]]
            if(typeof(palavra) == 'undefined')
                palavrasSoma[palavrasConteudo[j]] = 1
            else
            {
                palavrasSoma[palavrasConteudo[j]] = palavra + 1
            }
                
            
        }
        hashDocumentosPalavras[resultado[i].nome] = hashPalavras

    }   
    let tfidfs = {}
    
    for(let i = 0; i < resultado.length; i++)
    {  
       let doc = hashDocumentosPalavras[resultado[i].nome]
       let addtfidf = []
       for(let palavra in palavrasSoma)
       {
            let tfidf;
            let multiplicador = doc[palavra]
            if(typeof(multiplicador) === 'undefined')
                tfidf = 0
            else
            {
                let log = Math.log10(resultado.length / palavrasSoma[palavra])
                tfidf = multiplicador * log
            }
            addtfidf.push ({termo : palavra, tfidf : tfidf})
       }
       tfidfs[resultado[i].nome] = addtfidf
       
    }

    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
      });
      
    rl.on('line', function(linha){
        linha =  vetorial.RemoverStopWords(linha)
        let palavrasbusca = linha.split(' ');
        let tfidfbusca =  {}
        let hashmapbusca = getHashMapPalavras(palavrasbusca)

        for(let palavra in palavrasSoma)
        {
            let tfidf;
            let multiplicador = hashmapbusca[palavra]
            if(typeof(multiplicador) === 'undefined')
                tfidf = 0
            else
            {
                let logm = Math.log10(resultado.length / palavrasSoma[palavra])
                tfidf = multiplicador * logm
            }
            
            tfidfbusca[palavra] = tfidf
        }
        let rank = []
        for(let tdoc in tfidfs)
        {
            let dividendo = 0;
            let divisor1 = 0;
            let divisor2 = 0;
            for(let j = 0; j < tfidfs[tdoc].length; j++)
            {
                dividendo += (tfidfs[tdoc][j].tfidf * tfidfbusca[tfidfs[tdoc][j].termo])
                divisor2 += Math.pow(tfidfs[tdoc][j].tfidf, 2)
            }

            for(let palavra in tfidfbusca)
                divisor1 += Math.pow(tfidfbusca[palavra], 2)

            let divisor = Math.sqrt(divisor1 * divisor2)
            
            let simdoc = (divisor != 0) ? dividendo / divisor : 0

            rank.push({documento : tdoc, sim : simdoc})
        }
        rank.sort(CompararRank);
        console.log(rank)
        
    })
})


function CompararRank(a, b)
{
    if (a.sim < b.sim)
        return 1;
    if (a.sim > b.sim)
        return -1;
    return 0;
}