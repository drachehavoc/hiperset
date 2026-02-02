export { }

// ERROR: repeted keys in reglue block
// const sameVarName = Infinity
// hiperset: {
//   // set 
//   sameVarName          // ⧎ A chave 'sameVarName' foi definida mais de uma vez dentro do mesmo bloco.
//   sameName1: 12        // ⧎ A chave 'sameName1' foi definida mais de uma vez dentro do mesmo bloco.
//   sameName2: "hello"   // ⧎ A chave 'sameName2' foi definida mais de uma vez dentro do mesmo bloco.
//   sameName3: { }       // ⧎ A chave 'sameName3' foi definida mais de uma vez dentro do mesmo bloco.
//   // repeat, so error
//   sameVarName          // ⧎ A chave 'sameVarName' foi definida mais de uma vez dentro do mesmo bloco.
//   sameName1: 12        // ⧎ A chave 'sameName1' foi definida mais de uma vez dentro do mesmo bloco.
//   sameName2: "hello"   // ⧎ A chave 'sameName2' foi definida mais de uma vez dentro do mesmo bloco.
//   sameName3: { }       // ⧎ A chave 'sameName3' foi definida mais de uma vez dentro do mesmo bloco.
// } 

// // ERROR: os labels devem ser compatíveis com formatos válidos de variaveis, atributos, funções ou métodos
// hiperset: "0 string literal"

// // SINTAXE ERRORS
// // --labels-inicializadores-- = load | define | type 
// hiperset: { type: { } }     // ⧎ blocos hiperset devem seguir o padrão: `hiperset: --labels-inicializadores---: ⋯`
// hiperset: unkn: {}          // ERR: d20e1366-2029-4d25-b266-6e4dbd016708
// hiperset: load: 100         // ERR: 831f488c-ae3b-449a-b10a-0b45b3835c22
// hiperset: load: []          // ERR: 831f488c-ae3b-449a-b10a-0b45b3835c22
// hiperset: load: new Date()  // ERR: 831f488c-ae3b-449a-b10a-0b45b3835c22

// // SINTAXE ERRORS: repeted files
// hiperset: load: {
//   "__path/to/file/inline01.ts"       // ERR: a7d488e6-f1b0-4306-acb9-e46d362458aa
//   "__path/to/file01.ts"              // ERR: a7d488e6-f1b0-4306-acb9-e46d362458aa
//   namespace2: "__path/to/file04.ts"  // ERR: 406b17d7-63f9-4389-a65e-ac8631b1040a
//   namespace3: "__path/to/file05.ts"  // ERR: 406b17d7-63f9-4389-a65e-ac8631b1040a
// }

// LOAD INLINE
hiperset: load: "./__path/to/file/inline01.ts"  // importa o arquivo01 e carrega seu conteúdo sem namespace
hiperset: load: "./__path/to/file/inline02.ts"  // importa o arquivo02 e carrega seu conteúdo sem namespace, sobrescrevendo o conteúdo anterior se houver conflito

// LOAD BLOCK
hiperset: load: { 
  "./__path/to/file01.ts"              // importa o arquivo01 e carrega seu conteúdo sem namespace
  "./__path/to/file02.ts"              // importa o arquivo02 e carrega seu conteúdo sem namespace, sobrescrevendo o conteúdo anterior se houver conflito
  namespace1: "./__path/to/file03.ts"  // importa o arquivo03 e carrega seu conteúdo dentro do namespace1
  namespace2: "./__path/to/file04.ts"  // importa o arquivo04 e carrega seu conteúdo dentro do namespace2
  namespace3: "./__path/to/file05.ts"  // importa o arquivo04 e carrega seu conteúdo dentro do namespace2
}