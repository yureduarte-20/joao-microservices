export const javascriptPrefix = `
const process =  require('process');
let ___arg__index__ = 2;
const __output_array = [];
process.setUncaughtExceptionCaptureCallback(cb => {
    process.stderr.write(JSON.stringify({ name:cb.name, stack: cb.stack,  message: cb.message}))
    process.exit(1);
});
process.on('exit', (code) =>{
    if(code) return;
    process.stdout.write(JSON.stringify({ output_as_string: __output_array.join('').trimEnd(), output_as_array:__output_array.map( item => item.trimEnd() ) }))
})
const __handle_output_as_json = (...data) =>{
    __output_array.push(data.join('') + '\\n')
}
const ___handle_type_argv = arg =>{
    if(!arg) return
    if(arg[0] == ':')
        return arg.slice(1)
    if(isNaN(Number(arg))) return arg;
    return Number(arg)
}
const window = {
    prompt: (...msg) => getNextArgument(),
    alert : (...msg) => __handle_output_as_json(...msg )
}
const getNextArgument = (msg) =>{
    if((process.argv.length - 1) < ___arg__index__) throw new RangeError("Seu código exige muitas entradas, corrija-o.");

    return ___handle_type_argv (process.argv[___arg__index__++])
};
/*
  below will be the javascript code generataded by blockly
  all outputs is stored in a array and when execution ends
  the script above will send a JSON stream into the stdout
  which can be easily handled in order to determinate the better
  status code

*/
`

export const oldPrefixJavascript = (args?: string[]) => `
let _args_variables = '${args?.join(',')}';
_args_variables = _args_variables.split(',').map(item => isNaN(Number(item)) ? (item[0] === ":" ? item.slice(1) : item  ) : Number(item))
let __argsIndex = 0;
const window = {
  alert:(...msg ) => console.log(...msg),
  prompt:(...args) => _args_variables[__argsIndex++]
};

`;
