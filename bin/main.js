
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



lerDiretorio(diretorio).then((resultado) =>
{
    /**
     * @type {Array.<ConteudoArquivos>}
     */
    resultado
    let palavrasSoma = new HashMap();
    let hashDocumentosPalavras = new HashMap();

    for(let i = 0; i < resultado.length; i++)
    {
        
        resultado[i].conteudo =  vetorial.RemoverStopWords(resultado[i].conteudo)
        let palavrasConteudo = resultado[i].conteudo.split(' ');

        let hashPalavras = new HashMap();
        for(let j = 0; j < palavrasConteudo.length; j++)
        {
            let quantidadePalavra = hashPalavras.get(palavrasConteudo[j]);
            
            if(typeof(quantidadePalavra) == 'undefined')
                hashPalavras.set(palavrasConteudo[j], 1)
            else
                hashPalavras.set(palavrasConteudo[j] ,quantidadePalavra + 1)
            
            /*let indice = palavras.indexOf(palavrasConteudo[j])
            if(indice == -1)
                palavras.push(palavrasConteudo[j])*/

            let palavra = palavrasSoma.get(palavrasConteudo[j])
            if(typeof(palavra) == 'undefined')
                palavrasSoma.set(palavrasConteudo[j], 1)
            else
            {
                palavrasSoma.set(palavrasConteudo[j], palavra + 1)
            }
                
            
        }
        hashDocumentosPalavras.set(resultado[i].nome, hashPalavras)

    }   
    palavrasSoma.forEach(function(value, key) {
        console.log(key + " : " + value);
        console.log("-------------")
    });

    let tfidfdocs = new HashMap();
    for(let i = 0; i < resultado.length; i++)
    {  
       let doc = hashDocumentosPalavras.get(resultado[i].nome) 
       console.log(doc)
    }

})

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  
rl.on('line', function(line){
    console.log(line);
})