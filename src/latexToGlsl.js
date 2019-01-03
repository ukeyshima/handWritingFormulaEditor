import katex from 'katex';
import mathjs from 'mathjs';
import mathIntegral from 'mathjs-simple-integral';
import atl from 'asciimath-to-latex';
import * as glsl from 'glsl-man';

let code = ``;
let returnVariable = '';

const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl');

let resultCounter = 0;

mathjs.import(mathIntegral);
let latex2glsl,
  radix,
  frac,
  pow,
  sin,
  cos,
  tan,
  leftright,
  naturalLog,
  log,
  sum,
  definiteIntegral,
  indefiniteIntegral,
  differential,
  limit,
  matrix,
  shape,
  nextMulti,
  int2dec,
  dot,
  codeSearch,
  returnType,
  typeDetermination,
  nextMathordMulti;

codeSearch = (code, name) => {
  let result = null;
  glsl.parse(code).statements.forEach(e => {
    switch (e.type) {
      case 'declarator':
        if (e.declarators[0].name.name === name) result = e;
        break;
      case 'function_declaration':
        if (e.name === 'main') {
          e.body.statements.forEach(f => {
            if (
              f.hasOwnProperty('declarators') &&
              f.declarators[0].name.name === name
            ) {
              result = f;
            }
          });
        } else {
          if (e.name === name) result = e;
        }
        break;
    }
  });
  return result;
};

returnType = (code, name) => {
  let object = codeSearch(code, name);
  let result = { type: 'float', function: false, parameter: null };
  if (object) {
    switch (object.type) {
      case 'declarator':
        result = {
          type: object.typeAttribute.name,
          function: false,
          parameter: null
        };
        break;
      case 'function_declaration':
        result = {
          type: object.returnType.name,
          function: true,
          parameter: object.parameters.map(e => e.type_name)
        };
        break;
      default:
        break;
    }
  }
  return result;
};

typeDetermination = expression => {
  const shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(
    shader,
    `void main(void) {
      mat2 expression${int2dec(expression)};
    }`
  );
  gl.compileShader(shader);
  let infolog = gl.getShaderInfoLog(shader);
  const undifinedsVariable = infolog.match(
    /\'[a-zA-Z]\d*\' : undeclared identifier/g
  );
  const undifinedsFunction = infolog.match(
    /\'[a-zA-Z]\d*\' : no matching overloaded function found/g
  );
  let undifineds = [];
  if (undifinedsVariable) {
    undifineds = undifineds.concat(undifinedsVariable);
  }
  if (undifinedsFunction) {
    undifineds = undifineds.concat(undifinedsFunction);
  }
  undifineds = undifineds.map(e => {
    const name = e.split("'")[1];
    const type = returnType(code, e.split("'")[1]);
    return {
      name: name,
      type: type.type,
      function: type.function,
      parameter: type.parameter
    };
  });
  let define = '';
  undifineds.forEach(e => {
    define += e.function
      ? `${e.type} ${e.name}(${(() => {
          let result = '';
          e.parameter.forEach((f, i) => {
            result += `${f} x${i},`;
          });
          result = result.slice(0, result.length - 1);
          return result;
        })()}){
      return ${e.type}(0.0);
    }\n`
      : `${e.type} ${e.name} = ${e.type}(0.0);\n`;
  });
  gl.shaderSource(
    shader,
    `${define}
      void main(void) {        
        mat2 expression${int2dec(expression)};
      }`
  );
  gl.compileShader(shader);
  infolog = gl.getShaderInfoLog(shader);
  const splitText = infolog.split("'");
  const errorText = splitText[splitText.length - 4];
  let result = '';
  switch (errorText) {
    case 'const float':
      result = 'float';
      break;
    case 'float':
      result = 'float';
      break;
    case 'const highp 2-component vector of float':
      result = 'vec2';
      break;
    case 'highp 2-component vector of float':
      result = 'vec2';
      break;
    case 'const highp 3-component vector of float':
      result = 'vec3';
      break;
    case 'highp 3-component vector of float':
      result = 'vec3';
      break;
    case 'const highp 4-component vector of float':
      result = 'vec4';
      break;
    case 'highp 4-component vector of float':
      result = 'vec4';
      break;
    case 'const highp 2X2 matrix of float':
      result = 'mat2';
      break;
    case 'highp 2X2 matrix of float':
      result = 'mat2';
      break;
    case 'const highp 3X3 matrix of float':
      result = 'mat3';
      break;
    case 'highp 3X3 matrix of float':
      result = 'mat3';
      break;
    case 'const highp 4X4 matrix of float':
      result = 'mat4';
      break;
    case 'highp 4X4 matrix of float':
      result = 'mat4';
      break;
    default:
      result = 'float';
      break;
  }
  return result;
};

int2dec = input => {
  input = input.replace(/(\d+)(?!\.|\d)/g, '$1.0');
  input = input.replace(/([a-zA-Z])(\d+)\.0/g, '$1$2');
  input = input.replace(/\[(\d+)\.0/g, '[$1');
  input = input.replace(/\.(\d+)\.0/g, '.$1');
  return input;
};

radix = input => {
  return input.index
    ? (() => {
        if (
          (input.body.body[0].type === 'supsub' &&
            input.body.body[0].base.name === '\\sum') ||
          (input.index.body[0].type === 'supsub' &&
            input.index.body[0].base.name === '\\sum')
        ) {
          return (() => {
            const expression =
              input.body.body[0].type === 'supsub' &&
              input.body.body[0].base.name === '\\sum'
                ? sum(input.body.body)
                : (() => {
                    resultCounter++;
                    return `${typeDetermination(
                      shape(input.body)
                    )} result${resultCounter}=${shape(input.body.body)};`;
                  })();
            const result = `result${resultCounter}`;
            const indexExpression =
              input.index.body[0].type === 'supsub' &&
              input.index.body[0].base.name === '\\sum'
                ? sum(input.index.body)
                : (() => {
                    resultCounter++;
                    return `${typeDetermination(
                      shape(input.index.body)
                    )} result${resultCounter}=${shape(input.index.body)};`;
                  })();
            const indexResult = `result${resultCounter}`;
            resultCounter++;
            returnVariable = `${typeDetermination(
              `pow(${result},1.0/${indexResult})`
            )} result${resultCounter}`;
            return `${expression}
    ${indexExpression}
    ${typeDetermination(
      `pow(${result},1.0/${indexResult})`
    )} result${resultCounter}= pow(${result},1.0/${indexResult})
    `;
          })();
        } else {
          return `pow(${shape(input.body)},1.0/${shape(input.index.body)})`;
        }
      })()
    : (() => {
        if (
          input.body.body[0].type === 'supsub' &&
          input.body.body[0].base.name === '\\sum'
        ) {
          const expression = sum(input.body.body);
          const result = `result${resultCounter}`;
          resultCounter++;
          returnVariable = `${typeDetermination(
            `sqrt(${result})`
          )} result${resultCounter}`;
          return `${expression}
  ${typeDetermination(
    `sqrt(${result})`
  )} result${resultCounter}= sqrt(${result})`;
        } else {
          return input.body.body[0].type === 'leftright'
            ? `sqrt${shape(input.body.body)}`
            : `sqrt(${shape(input.body.body)})`;
        }
      })();
};

frac = input => {
  if (
    (input.numer.body[0].type === 'supsub' &&
      input.numer.body[0].base.name === '\\sum') ||
    (input.denom.body[0].type === 'supsub' &&
      input.denom.body[0].base.name === '\\sum')
  ) {
    return (() => {
      const numerExpression =
        input.numer.body[0].type === 'supsub' &&
        input.numer.body[0].base.name === '\\sum'
          ? sum(input.numer.body)
          : (() => {
              resultCounter++;
              return `${typeDetermination(
                shape(input.numer.body)
              )} result${resultCounter}=${shape(input.numer.body)};`;
            })();
      const numerResult = `result${resultCounter}`;
      const denomExpression =
        input.denom.body[0].type === 'supsub' &&
        input.denom.body[0].base.name === '\\sum'
          ? sum(input.denom.body)
          : (() => {
              resultCounter++;
              return `${typeDetermination(
                shape(input.denom.body)
              )} result${resultCounter}=${shape(input.denom.body)};`;
            })();
      const denomResult = `result${resultCounter}`;
      resultCounter++;
      returnVariable = `${typeDetermination(
        `${numerResult}/${denomResult}`
      )} result${resultCounter}`;
      return `${numerExpression}
  ${denomExpression}
  ${typeDetermination(
    `${numerResult}/${denomResult}`
  )} result${resultCounter}=${numerResult}/${denomResult}
  `;
    })();
  } else {
    return `${shape(input.numer.body)}/${shape(input.denom.body)}`;
  }
};

pow = input => {
  return `pow(${
    input.base.type === 'leftright' ? shape(input.base.body) : shape(input.base)
  },${
    input.sup.body[0].type === 'leftright'
      ? shape(input.sup.body[0].body)
      : shape(input.sup.body)
  })`;
};

sin = input => {
  return input.type === 'leftright'
    ? `sin${shape(input)}`
    : `sin(${shape(input)})`;
};

cos = input => {
  return input.type === 'leftright'
    ? `cos${shape(input)}`
    : `cos(${shape(input)})`;
};

tan = input => {
  return input.type === 'leftright'
    ? `tan${shape(input)}`
    : `tan(${shape(input)})`;
};

leftright = input => {
  let left = '(';
  let right = ')';
  if (input.left === '[') {
    left = 'floor(';
  }
  return `${left}${shape(input.body)}${right}`;
};

naturalLog = input => {
  return input.type === 'leftright'
    ? `log${shape(input)}`
    : `log(${shape(input)})`;
};

log = input => {
  const base = shape(input[0].sub.body);
  const expression = input[1];
  return expression.type === 'leftright'
    ? `log${shape(expression)}/log(${base})`
    : `log(${shape(expression)})/log(${base})`;
};

sum = input => {
  resultCounter++;
  const expression = shape(input.slice(1, input.length));
  const index = input[0].sub.body.findIndex(e => {
    return e.type === 'atom' && e.text === '=';
  });
  const startVari = shape(input[0].sub.body.slice(0, index));
  const startValu = shape(
    input[0].sub.body.slice(index + 1, input[0].sub.body.length)
  );
  const end = shape(input[0].sup.body);
  returnVariable = `${typeDetermination(expression)} result${resultCounter}`;
  return `${typeDetermination(
    expression
  )} result${resultCounter} = ${typeDetermination(expression)}(0.0);
        for(float ${startVari}=${startValu};${startVari}<${end};${startVari}++){
            result${resultCounter} += ${expression};
        }`;
};

definiteIntegral = (input, deltaIndex) => {
  const start = shape(input[0].sub.body);
  const end = shape(input[0].sup.body);
  const expression = shape(input.slice(1, deltaIndex));
  const val = shape(input[deltaIndex + 1]);
  return `((${val}=>{return ${latex2glsl(
    atl(mathjs.integral(expression, val).toString())
  )}})(${end})-(${val}=>{return ${latex2glsl(
    atl(mathjs.integral(expression, val).toString())
  )}})(${start}))`;
};

indefiniteIntegral = (input, deltaIndex) => {
  const expression = shape(input.slice(1, deltaIndex));
  const val = shape(input[deltaIndex + 1]);
  return `(${latex2glsl(atl(mathjs.integral(expression, val).toString()))})`;
};

differential = input => {
  const expression = shape(input.base)
    .replace(/Math\./g, '')
    .replace(/pow\((.*)\,(.*)\)/g, '$1^$2');
  return mathjs.derivative(expression, 'x').toString();
};

limit = input => {
  const index = input[0].sub.body.findIndex(e => {
    return e.value === '\\rightarrow';
  });
  return `((${shape(input[0].sub.body.slice(0, index - 1))})=>${shape(
    input[1]
  )})(${shape(input[0].sub.body.slice(index, input[0].sub.body.length))})`;
};

matrix = input => {
  const type =
    input[0].length === 1 ? `vec${input.length}` : `mat${input.length}`;
  input = (() => {
    const array = input.slice(1, input.length);
    array.unshift(shape(input[0]));
    return array.reduce((previousValue, currentValue) => {
      return `${previousValue},${shape(currentValue)}`;
    });
  })();
  return `${type}(${input})`;
};

dot = (input1, input2) => {
  if (input2.type === 'accent') {
    return `dot(${shape(input1.base)},${shape(input2.base)})`;
  } else {
    return `dot(${shape(input1.base)},${shape(input2)})`;
  }
};

nextMulti = (input, num) => {
  return (() => {
    if (input.length > num) {
      if (
        input[num].type !== 'atom' &&
        input[num].type !== 'punct' &&
        input[num].type !== 'bin' &&
        input[num].type !== 'spacing' &&
        input[num].type !== 'styling'
      ) {
        return '*' + shape(input.slice(num, input.length));
      } else if (input[num].type === 'styling') {
        return ',' + shape(input.slice(num, input.length));
      } else {
        return shape(input.slice(num, input.length));
      }
    } else {
      return '';
    }
  })();
};

nextMathordMulti = (input, num) => {
  return input.length > num
    ? (input[num].type !== 'atom' &&
      input[num].type !== 'punct' &&
      input[num].type !== 'bin' &&
      input[num].type !== 'spacing' &&
      (input[num].type === 'leftright'
        ? shape(input[num]).length !== 3 &&
          !/\,/.test(shape(input[num])) &&
          !input[num].left === '['
        : true)
        ? `*`
        : ``) + shape(input.slice(num, input.length))
    : ``;
};

shape = input => {
  let result;
  if (!Array.isArray(input)) {
    switch (typeof input) {
      case 'object':
        input = [input];
        break;
      case 'string':
        return input;
      default:
        break;
    }
  }
  switch (input[0].type) {
    case 'textord':
      result = `${input[0].text === '\\infty' ? 99999999.99 : input[0].text}${
        input.length > 1
          ? (input[1].type !== 'textord' &&
            input[1].type !== 'atom' &&
            input[1].type !== 'bin' &&
            input[1].type !== 'spacing'
              ? '*'
              : '') + shape(input.slice(1, input.length))
          : ``
      }`;
      break;
    case 'mathord':
      result = `${
        input[0].text === '\\pi'
          ? `3.141592`
          : (() => {
              const nextExpression = `${(() => {
                if (input.length > 1) {
                  if (
                    input[1].type === 'leftright' &&
                    input[1].left === '[' &&
                    input[1].right === ']'
                  ) {
                    let index = input.slice(1, input.length).findIndex(e => {
                      return !(
                        e.type === 'leftright' &&
                        e.left === '[' &&
                        e.right === ']'
                      );
                    });
                    index = index === -1 ? input.length - 1 : index;
                    const array = input.slice(2, index + 1);
                    array.unshift(`[${shape(input[1].body)}]`);
                    return `${array.reduce((pre, cur) => {
                      return pre + `[${shape(cur.body)}]`;
                    })}${nextMathordMulti(input, index + 1)}`;
                  } else {
                    return nextMathordMulti(input, 1);
                  }
                } else {
                  return ``;
                }
              })()}`;
              return input.length > 1 &&
                input[1].type === 'atom' &&
                input[1].text === '='
                ? `${typeDetermination(nextExpression)} ${
                    input[0].text
                  }${nextExpression}`
                : `${input[0].text}${nextExpression}`;
            })()
      }`;
      break;
    case 'spacing':
      result = `],[${
        input.length > 1 ? shape(input.slice(1, input.length)) : ''
      }`;
      break;
    case 'styling':
      result = `${shape(input[0].body)}${nextMulti(input, 1)}`;
      break;
    case 'atom':
      switch (input[0].text) {
        case '\\cdot':
          result = `*${
            input.length > 1 ? shape(input.slice(1, input.length)) : ''
          }`;
          break;
        default:
          result = `${input[0].text}${
            input.length > 1 ? shape(input.slice(1, input.length)) : ''
          }`;
          break;
      }
      break;
    case 'punct':
      result = `${input[0].value}${
        input.length > 1 ? shape(input.slice(1, input.length)) : ``
      }`;
      break;
    case 'ordgroup':
      result = `${shape(input[0].body)}${nextMulti(input, 1)}`;
      break;
    case 'sqrt':
      result = `${radix(input[0])}${nextMulti(input, 1)}`;
      break;
    case 'accent':
      result =
        input[0].label === '\\vec' || input[0].label === '\\overrightarrow'
          ? (() => {
              if (input.length > 1) {
                if (input[1].type === 'atom' && input[1].text === '\\cdot') {
                  return `${dot(input[0], input[2])}${nextMulti(input, 3)}`;
                } else if (input[1].type === 'atom' && input[1].text === '=') {
                  const expression = shape(input.slice(1, input.length));
                  return `${typeDetermination(expression)} ${shape(
                    input[0].base
                  )}${expression}`;
                } else {
                  return `${shape(input[0].base)}${shape(
                    input.slice(1, input.length)
                  )}`;
                }
              } else {
                return shape(input[0].base);
              }
            })()
          : '';
      break;
    case 'leftright':
      result = `${
        input[0].body[0].type === 'array'
          ? (() => {
              if (
                input.length > 1 &&
                matrix(input[0].body[0].body).slice(0, 3) === 'vec' &&
                input[1].type === 'leftright' &&
                matrix(input[1].body[0].body).slice(0, 3) === 'vec'
              ) {
                return `dot(${matrix(input[0].body[0].body)},${matrix(
                  input[1].body[0].body
                )})`;
              } else {
                return `${matrix(input[0].body[0].body)}${nextMulti(input, 1)}`;
              }
            })()
          : `${leftright(input[0])}${nextMulti(input, 1)}`
      }`;
      break;
    case 'array':
      result = shape(input[0].body[0][0]);
      break;
    case 'genfrac':
      result = `${frac(input[0])}${nextMulti(input, 1)}`;
      break;
    case 'bin':
      switch (input[0].value) {
        case '\\cdot':
          result = `*${shape(input.slice(1, input.length))}`;
          break;
        default:
          result = `${input[0].value}${nextMulti(input, 1)}`;
          break;
      }
      break;
    case 'op':
      switch (input[0].name) {
        case '\\sin':
          result = `${sin(input[1])}${nextMulti(input, 2)}`;
          break;
        case '\\cos':
          result = `${cos(input[1])}${nextMulti(input, 2)}`;
          break;
        case '\\tan':
          result = `${tan(input[1])}${nextMulti(input, 2)}`;
          break;
        case '\\log':
          result = `${naturalLog(input[1])}${nextMulti(input, 2)}`;
          break;
        case '\\int':
          const deltaIndex = input.findIndex(e => {
            return e.type === 'mathord' && e.text === 'd';
          });
          result = `${indefiniteIntegral(input, deltaIndex)}${nextMulti(
            input,
            deltaIndex + 2
          )}`;
          break;
        default:
          break;
      }
      break;
    case 'supsub':
      if (input[0].sub) {
        switch (input[0].base.name) {
          case '\\log':
            result = `${log(input)}${nextMulti(input, 2)}`;
            break;
          case '\\sum':
            result = sum(input);
            break;
          case '\\int':
            const deltaIndex = input.findIndex(e => {
              return e.type === 'mathord' && e.text === 'd';
            });
            result = `${definiteIntegral(input, deltaIndex)}${nextMulti(
              input,
              deltaIndex + 2
            )}`;
            break;
          case '\\lim':
            result = `${limit(input)}${nextMulti(input, 2)}`;
            break;
          default:
            const array = input[0].sub.body.find(e => {
              return e.type === 'textord';
            });
            result = array
              ? (() => {
                  return input.length > 1
                    ? (() => {
                        if (input[1].type === 'leftright') {
                          const func = codeSearch(
                            code,
                            `${shape(input[0].base)}${shape(input[0].sub.body)}`
                          );
                          return func
                            ? `${shape(input[0].base)}${shape(
                                input[0].sub.body
                              )}${shape(input.slice(1, input.length))}`
                            : `${shape(input[0].base)}${shape(
                                input[0].sub.body
                              )}${nextMulti(input, 1)}`;
                        } else if (
                          input[1].type === 'atom' &&
                          input[1].text === '='
                        ) {
                          const expression = int2dec(
                            shape(input.slice(1, input.length))
                          );
                          return `${typeDetermination(expression)} ${shape(
                            input[0].base
                          )}${shape(input[0].sub.body)}${expression}`;
                        } else {
                          return `${shape(input[0].base)}${shape(
                            input[0].sub.body
                          )}${nextMulti(input, 1)}`;
                        }
                      })()
                    : `${shape(input[0].base)}${shape(input[0].sub.body)}`;
                })()
              : `${shape(input[0].base)}${(() => {
                  const index = input[0].sub.body.slice(
                    1,
                    input[0].sub.body.length
                  );
                  index.unshift(`${input[0].sub.body[0].text}`);
                  return (
                    '.' +
                    index.reduce((prev, curr) => {
                      return prev + curr.text;
                    }) +
                    nextMulti(input, 1)
                  );
                })()}`;
            break;
        }
      } else {
        if (input[0].sup.body[0].text === '\\prime') {
          result = `${differential(input[0])}${nextMulti(input, 1)}`;
        } else {
          result = `${pow(input[0])}${nextMulti(input, 1)}`;
        }
      }
      break;
    default:
      result = `${input[0]}${nextMulti(input, 1)}`;
      break;
  }
  return result;
};

export default (latex2glsl = (input, program, count) => {
  code = program;
  resultCounter = count;
  while (input.search(/\n/) >= 0) {
    input = input.replace(/\n/g, ' ');
  }
  const parseTree = katex.__parse(input);
  return {
    code: int2dec(shape(parseTree)),
    variable: returnVariable,
    count: resultCounter
  };
});
