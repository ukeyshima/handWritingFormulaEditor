const katex = require('katex');
const mathjs = require('mathjs');
const mathIntegral = require('mathjs-simple-integral');
const atl = require('asciimath-to-latex');
const acorn = require('acorn');
mathjs.import(mathIntegral);

let code = '';

let latex2js,
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
  dot,
  matrixMultiplication,
  matrixOperations,
  matrixLeftRightShape,
  shape,
  nextMulti,
  codeSearchVariable,
  codeSearchArray,
  codeSearchFunction,
  splitCodeClose,
  vecShape,
  isVector;

splitCodeClose = splitCode => {
  if (/=[\n\s]*$/.test(splitCode)) {
    splitCode += "''";
  }
  if (splitCode.split('{').length > splitCode.split('}').length) {
    splitCode =
      splitCode +
      `${(() => {
        let result = '';
        for (
          let i = 0;
          i < splitCode.split('{').length - splitCode.split('}').length;
          i++
        ) {
          result += '}';
        }
        return result;
      })()}`;
  } else if (splitCode.split('{').length < splitCode.split('}').length) {
    splitCode =
      `${(() => {
        let result = '';
        for (
          let i = 0;
          i < splitCode.split('}').length - splitCode.split('{').length;
          i++
        ) {
          result += '{';
        }
        return result;
      })()}` + splitCode;
  }
  if (splitCode.split('(').length > splitCode.split(')').length) {
    splitCode =
      splitCode +
      `${(() => {
        let result = '';
        for (
          let i = 0;
          i < splitCode.split('(').length - splitCode.split(')').length;
          i++
        ) {
          result += ')';
        }
        return result;
      })()}`;
  } else if (splitCode.split('(').length < splitCode.split(')').length) {
    splitCode =
      `${(() => {
        let result = '';
        for (
          let i = 0;
          i < splitCode.split(')').length - splitCode.split('(').length;
          i++
        ) {
          result += '(';
        }
        return result;
      })()}` + splitCode;
  }
  if (/^[\s\n]*\([\s\S]*\)[\s\n\;]*$/.test(splitCode)) {
    splitCode = splitCode.replace(/^[\s\n]*\(/, '');
    splitCode = splitCode.replace(/\)[\s\n;]*$/, '');
  }
  return splitCode;
};
codeSearchVariable = (code, variable) => {
  const glovalSplitCode = code.split(/\/\*\d+\*\//);
  const blockUpCodes = [];
  const blockUpCode = count => {
    let closeCount = count;
    let openCount = 0;
    let text = '';
    for (let i = glovalSplitCode[0].length - 1; i >= 0; i--) {
      let character = glovalSplitCode[0][i];
      if (character === '}') {
        closeCount++;
      } else if (character === '{') {
        openCount++;
      }
      if (closeCount === openCount) {
        blockUpCodes.push(text);
        blockUpCode(count + 1);
        break;
      }
      text = character + text;
      if (i === 0) blockUpCodes.push(text);
    }
  };
  blockUpCode(1);
  const blockUpCodeBools = [];
  blockUpCodes.forEach(e => {
    blockUpCodeBools.push(
      acorn.parse(splitCodeClose(e)).body.some(e => {
        return (
          e.type === 'VariableDeclaration' &&
          !e.declarations.some(
            f => f.init.type === 'ArrowFunctionExpression'
          ) &&
          e.declarations.some(f => f.id.name === variable)
        );
      })
    );
  });
  if (blockUpCodeBools.length > 0) {
    return blockUpCodeBools.reduce((prev, cur) => {
      return prev || cur;
    });
  } else {
    return false;
  }
};
codeSearchFunction = (code, variable) => {
  const glovalSplitCode = code.split(/\/\*\d+\*\//);
  const blockUpCodes = [];
  const blockDownCodes = [];
  const blockUpCode = count => {
    let closeCount = count;
    let openCount = 0;
    let text = '';
    for (let i = glovalSplitCode[0].length - 1; i >= 0; i--) {
      let character = glovalSplitCode[0][i];
      if (character === '}') {
        closeCount++;
      } else if (character === '{') {
        openCount++;
      }
      if (closeCount === openCount) {
        blockUpCodes.push(text);
        blockUpCode(count + 1);
        break;
      }
      text = character + text;
      if (i === 0) blockUpCodes.push(text);
    }
  };
  const blockDownCode = count => {
    let openCount = count;
    let closeCount = 0;
    let text = '';
    for (let i = 0; i < glovalSplitCode[1].length; i++) {
      let character = glovalSplitCode[1][i];
      if (character === '{') {
        openCount++;
      } else if (character === '}') {
        closeCount++;
      }
      if (openCount === closeCount) {
        blockDownCodes.push(text);
        blockDownCode(count + 1);
        break;
      }
      text += character;
      if (i === glovalSplitCode[1].length - 1) blockDownCodes.push(text);
    }
  };
  blockUpCode(1);
  blockDownCode(1);
  const blockUpCodeBools = [];
  const blockDownCodeBools = [];
  blockUpCodes.forEach(e => {
    blockUpCodeBools.push(
      acorn.parse(splitCodeClose(e)).body.some(e => {
        return (
          (e.type === 'VariableDeclaration' &&
            e.declarations.some(
              f => f.init.type === 'ArrowFunctionExpression'
            ) &&
            e.declarations.some(f => f.id.name === variable)) ||
          (e.type === 'FunctionDeclaration' && e.id.name === variable)
        );
      })
    );
  });
  blockDownCodes.forEach(e => {
    blockDownCodeBools.push(
      acorn.parse(splitCodeClose(e)).body.some(e => {
        return e.type === 'FunctionDeclaration' && e.id.name === variable;
      })
    );
  });
  if (blockUpCodeBools.length > 0 && blockDownCodeBools.length > 0) {
    return (
      blockUpCodeBools.reduce((prev, cur) => {
        return prev || cur;
      }) ||
      blockDownCodeBools.reduce((prev, cur) => {
        return prev || cur;
      })
    );
  } else {
    return false;
  }
};
codeSearchArray = (code, variable) => {
  const glovalSplitCode = code.split(/\/\*\d+\*\//);
  const blockUpCodes = [];
  const blockUpCode = count => {
    let closeCount = count;
    let openCount = 0;
    let text = '';
    for (let i = glovalSplitCode[0].length - 1; i >= 0; i--) {
      let character = glovalSplitCode[0][i];
      if (character === '}') {
        closeCount++;
      } else if (character === '{') {
        openCount++;
      }
      if (closeCount === openCount) {
        blockUpCodes.push(text);
        blockUpCode(count + 1);
        break;
      }
      text = character + text;
      if (i === 0) blockUpCodes.push(text);
    }
  };
  blockUpCode(1);
  const blockUpCodeBools = [];
  blockUpCodes.forEach(e => {
    blockUpCodeBools.push(
      acorn.parse(splitCodeClose(e)).body.some(e => {
        return (
          e.type === 'VariableDeclaration' &&
          e.declarations.some(f => f.init.type === 'ArrayExpression') &&
          e.declarations.some(f => f.id.name === variable)
        );
      })
    );
  });
  if (blockUpCodeBools.length > 0) {
    return blockUpCodeBools.reduce((prev, cur) => {
      return prev || cur;
    });
  } else {
    return false;
  }
};
radix = input => {
  return input.index
    ? `Math.pow(${shape(input.body)},1/${shape(input.index.body)})`
    : input.body.body[0].type === 'leftright'
    ? `Math.sqrt${shape(input.body.body)}`
    : `Math.sqrt(${shape(input.body.body)})`;
};

isVector = input => {
  let variable = [];
  let variableArray = [];
  const isVectorShape = input => {
    if (!input) return;
    if (input.length === 0) return;
    if (!Array.isArray(input)) {
      input = [input];
    }
    if (Array.isArray(input[0])) {
      input.forEach(e => {
        isVectorShape(e);
      });
      return;
    }
    switch (input[0].type) {
      case 'accent':
        const vari = shape(input[0].base.body);
        variableArray.push(vari);
        if (input.length > 1) {
          isVectorShape(input.slice(1, input.length));
        }
        break;
      case 'mathord':
        const vars = [];
        let index = 0;
        for (let i = 0; i < input.length; i++) {
          if (input[i].type === 'mathord' || input[i].type === 'textord') {
            vars.push(input[i]);
            index++;
          } else {
            break;
          }
        }
        const varia = shape(vars).split('*');
        variable = variable.concat(varia);
        if (input.length > 1) {
          isVectorShape(input.slice(index, input.length));
        }
        break;
      default:
        if (input[0].hasOwnProperty('body')) {
          isVectorShape(input[0].body);
        }
        if (input[0].hasOwnProperty('base')) {
          isVectorShape(input[0].base);
        }
        if (input[0].hasOwnProperty('sup')) {
          isVectorShape(input[0].sup);
        }
        if (input[0].hasOwnProperty('sub')) {
          isVectorShape(input[0].sub);
        }
        if (input[0].hasOwnProperty('denom')) {
          isVectorShape(input[0].denom);
        }
        if (input[0].hasOwnProperty('numer')) {
          isVectorShape(input[0].numer);
        }
        if (input.length > 1) {
          isVectorShape(input.slice(1, input.length));
        } else {
          return;
        }
        break;
    }
  };
  isVectorShape(input);
  variable = variable.filter((x, i, self) => self.indexOf(x) === i);
  variableArray = variableArray.filter((x, i, self) => self.indexOf(x) === i);
  let str = '';
  variable.forEach(e => {
    str += `let ${e}=0;`;
  });
  variableArray.forEach(e => {
    str += `let ${e}=[];`;
  });
  str += shape(input);
  return Array.isArray(eval(str));
};

frac = input => {
  if (isVector(input.numer.body)) {
    return `${shape(input.numer.body)}.map(e=>e/(${shape(input.denom.body)}))`;
  } else {
    return `((${shape(input.numer.body)})/(${shape(input.denom.body)}))`;
  }
};

pow = input => {
  return `Math.pow(${
    input.base.type === 'leftright' ? shape(input.base.body) : shape(input.base)
  },${
    input.sup.body[0].type === 'leftright'
      ? shape(input.sup.body[0].body)
      : shape(input.sup.body)
  })`;
};

sin = input => {
  if (!input) return 'sin';
  return input.type === 'leftright'
    ? `Math.sin${shape(input)}`
    : `Math.sin(${shape(input)})`;
};

cos = input => {
  if (!input) return 'cos';
  return input.type === 'leftright'
    ? `Math.cos${shape(input)}`
    : `Math.cos(${shape(input)})`;
};

tan = input => {
  if (!input) return 'tan';
  return input.type === 'leftright'
    ? `Math.tan${shape(input)}`
    : `Math.tan(${shape(input)})`;
};

leftright = input => {
  if (input[0].left === '[' && input[0].right === ']') {
    return `Math.floor(${shape(input[0].body)})${nextMulti(input, 1)}`;
  } else if (input[0].left === '|' && input[0].right === '|') {
    if (isVector(input[0].body)) {
      return `${shape(
        input[0].body
      )}.reduce((pre,cur)=>pre+Math.pow(cur,2),0)${nextMulti(input, 1)}`;
    } else {
      return `Math.abs(${shape(input[0].body)})${nextMulti(input, 1)}`;
    }
  } else {
    return isVector(input.slice(1, input.length))
      ? isVector([input[0]])
        ? `${shape(input[0])}.reduce((pre,cur,num)=>pre+cur*${shape(
            input.slice(1, input.length)
          )}[num],0)`
        : `${shape(input.slice(1, input.length))}.map(e=>e*(${shape(
            input[0].body
          )}))`
      : `(${shape(input[0].body)})${nextMulti(input, 1)}`;
  }
};

naturalLog = input => {
  if (!input) return 'log';
  return input.type === 'leftright'
    ? `Math.log${shape(input)}`
    : `Math.log(${shape(input)})`;
};

log = input => {
  if (!input) return 'log';
  const base = shape(input[0].sub.body);
  const expression = input[1];
  return expression.type === 'leftright'
    ? `(Math.log${shape(expression)}/Math.log(${base}))`
    : `(Math.log(${shape(expression)})/Math.log(${base}))`;
};

sum = input => {
  const expression = shape(input.slice(1, input.length));
  const index = input[0].sub.body.findIndex(e => {
    return e.type === 'atom' && e.text === '=';
  });
  const startVari = shape(input[0].sub.body.slice(0, index));
  const startValu = shape(
    input[0].sub.body.slice(index + 1, input[0].sub.body.length)
  );
  const end = shape(input[0].sup.body);
  return `((() => {
        let result = 0;
        for(let ${startVari}=${startValu};${startVari}<${end};${startVari}++){
            result += ${expression};
        }
        return result;
    })())`;
};

definiteIntegral = (input, deltaIndex) => {
  const start = shape(input[0].sub.body);
  const end = shape(input[0].sup.body);
  const expression = shape(input.slice(1, deltaIndex)).replace(/Math\./g, '');
  const val = shape(input[deltaIndex + 1]);
  return `((${val}=>${latex2js(
    atl(mathjs.integral(expression, val).toString())
  )})(${end})-(${val}=>${latex2js(
    atl(mathjs.integral(expression, val).toString())
  )})(${start}))`;
};

indefiniteIntegral = (input, deltaIndex) => {
  const expression = shape(input.slice(1, deltaIndex)).replace(/Math\./g, '');
  const val = shape(input[deltaIndex + 1]);
  return `(${latex2js(atl(mathjs.integral(expression, val).toString()))})`;
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
  if (index === -1) return `lim`;
  return `((${shape(input[0].sub.body.slice(0, index - 1))})=>${shape(
    input[1]
  )})(${shape(input[0].sub.body.slice(index, input[0].sub.body.length))})`;
};

matrix = input => {
  if (!input) {
    return [];
  }
  if (!input.hasOwnProperty('type')) {
    return input;
  }
  if (input.type === 'textord' || input.type === 'mathord') {
    return input.text;
  }
  return input.body[0].body.map(e => {
    return e.map(f => {
      return shape(f);
    });
  });
};

dot = (input1, input2) => {
  let result = '';
  input1.forEach((e, i) => {
    result += `+${e}*${input2[i]}`;
  });
  result = result.slice(1, result.length);
  return `(${result})`;
};

matrixMultiplication = (array, input) => {
  if (
    input.type === 'accent' &&
    (input.label === '\\vec' || input.label === '\\overrightarrow')
  ) {
    input = [
      (() => {
        const o = [];
        for (let i = 0; i < array.length; i++) {
          o.push([`${shape(input.base.body)}[${i}]`]);
        }
        return o;
      })()
    ];
  } else {
    input = [matrix(input)];
  }
  input.unshift(array);
  return (() => {
    if (!Array.isArray(input[0])) {
      if (input[0] === '') return input[1];
      return input[1].map(e => {
        if (Array.isArray(e)) {
          return e.map(f => {
            return `(${input[0]}*${f})`;
          });
        } else {
          return `(${input[0]}*${e})`;
        }
      });
    } else if (input[0][0].length === 1 && input[1][0].length === 1) {
      return dot(input[0], input[1]);
    } else {
      return (input => {
        const o = [];
        input[0].forEach((e, j) => {
          const q = [];
          for (let i = 0; i < input[1][0].length; i++) {
            let r = '';
            let k = 0;
            e.forEach((f, l) => {
              r += `+${f}*${input[1][k][i]}`;
              k++;
            });
            r = '(' + r.slice(1, r.length) + ')';
            q.push(r);
          }
          o.push(q);
        });
        return o;
      })(input);
    }
  })();
};

matrixOperations = (array, input, operations) => {
  if (Array.isArray(array)) {
    if (
      input.type === 'accent' &&
      (input.label === '\\vec' || input.label === '\\overrightarrow')
    ) {
      const o = [];
      array.forEach((f, i) => {
        o.push(f + operations + `${shape(input.base.body)}[${i}]`);
      });
      return o;
    } else if (Array.isArray(array[0])) {
      const o = [];
      array.forEach((e, j) => {
        const q = [];
        e.forEach((f, k) => {
          q.push(f + operations + input[j][k]);
        });
        o.push(q);
      });
      return o;
    } else {
      const o = [];
      array.forEach((f, i) => {
        o.push(f + operations + input[i]);
      });
      return o;
    }
  } else {
    return array + operations + input;
  }
};

const matrixCalculation = (array, input) => {
  let result = '';
  if (input.length === 0) return array;
  switch (input[0].type) {
    case 'accent':
      const length = matrix(
        input.find(e => {
          return e.type === 'leftright' && e.body[0].type === 'array';
        })
      ).length;
      result =
        input.length > 1
          ? matrixCalculation(
              matrixMultiplication(
                array,
                (() => {
                  const o = [];
                  for (let i = 0; i < length; i++) {
                    o.push([`${shape(input[0].base.body)}[${i}]`]);
                  }
                  return o;
                })()
              ),
              input.slice(1, input.length)
            )
          : matrixMultiplication(array, input[0]);
      break;
    case 'leftright':
      result =
        input.length > 1
          ? matrixCalculation(
              matrixMultiplication(array, input[0]),
              input.slice(1, input.length)
            )
          : matrixMultiplication(array, input[0]);
      break;
    case 'atom':
      switch (input[0].text) {
        case '\\cdot':
          result = (() => {
            return input.length > 2
              ? matrixCalculation(
                  matrixMultiplication(array, input[1]),
                  input.slice(2, input.length)
                )
              : matrixMultiplication(array, input[1]);
          })();
          break;
        case '\\times':
          result = (() => {
            return input.length > 2
              ? matrixCalculation(
                  matrixMultiplication(array, input[1]),
                  input.slice(2, input.length)
                )
              : matrixMultiplication(array, input[1]);
          })();
          break;
        default:
          result = (() => {
            let index = input.slice(1, input.length).findIndex((e, i, a) => {
              return e.type === 'atom' && e.text === '\\cdot';
            });
            index = index === -1 ? input.length : index;
            if (index === 2) {
              return input.length > 2
                ? (() => {
                    return input[1].type === 'accent'
                      ? matrixCalculation(
                          matrixOperations(array, input[1], input[0].text),
                          input.slice(2, input.length)
                        )
                      : matrixCalculation(
                          matrixOperations(
                            array,
                            matrix(input[1]),
                            input[0].text
                          ),
                          input.slice(2, input.length)
                        );
                  })()
                : (() => {
                    return input[1].type === 'accent'
                      ? matrixOperations(array, input[1], input[0].text)
                      : matrixOperations(
                          array,
                          matrix(input[1]),
                          input[0].text
                        );
                  })();
            } else {
              return (() => {
                return input.length > index
                  ? matrixCalculation(
                      matrixOperations(
                        array,
                        matrixCalculation(array, input.slice(1, index)),
                        input[0].text
                      ),
                      input.slice(index, input.length)
                    )
                  : matrixOperations(
                      array,
                      matrixCalculation(array, input.slice(1, index)),
                      input[0].text
                    );
              })();
            }
          })();
          break;
      }
      break;
    default:
      let index2 = input.findIndex(e => {
        return (
          e.type === 'accent' &&
          (e.label === '\\vec' || e.label === '\\overrightarrow')
        );
      });
      if (index2 === -1) {
        let index = input.findIndex(e => {
          return e.type === 'leftright' && e.body[0].type === 'array';
        });
        result = matrixCalculation(
          shape(input.slice(0, index)),
          input.slice(index, input.length)
        );
      } else {
        let index = input.slice(0, index2).findIndex(e => {
          return e.type === 'leftright' && e.body[0].type === 'array';
        });
        if (index === -1) {
          result = (() => {
            if (Array.isArray(array)) {
              return matrixCalculation(
                matrixMultiplication(
                  shape(input.slice(0, index2)),
                  (() => {
                    const o = [];
                    for (let i = 0; i < array.length; i++) {
                      o.push([`${shape(input[index2])}[${i}]`]);
                    }
                    return o;
                  })()
                ),
                input.slice(index2 + 1, input.length)
              );
            } else {
              const length = matrix(
                input.find(e => {
                  return e.type === 'leftright' && e.body[0].type === 'array';
                })
              ).length;
              return matrixCalculation(
                matrixMultiplication(
                  shape(input.slice(0, index2)),
                  (() => {
                    const o = [];
                    for (let i = 0; i < length; i++) {
                      o.push([`${shape(input[index2])}[${i}]`]);
                    }
                    return o;
                  })()
                ),
                input.slice(index2 + 1, input.length)
              );
            }
          })();
        } else {
          result = matrixCalculation(
            shape(input.slice(0, index)),
            input.slice(index, input.length)
          );
        }
      }
      break;
  }
  return result;
};

matrixLeftRightShape = input => {
  if (
    input.some(e => {
      return e.type === 'atom' && e.text === '=';
    })
  ) {
    return shape(input);
  }
  const startIndex = input.findIndex((e, i, a) => {
    let id = a.slice(i + 1, a.length).findIndex(f => {
      return f.type === 'atom';
    });
    id = id === -1 ? a.length : id + i + 1;
    if (
      a.slice(i, id).some(g => {
        return (
          (g.type === 'leftright' && g.body[0].type === 'array') ||
          (g.type === 'accent' &&
            (g.label === '\\vec' || g.label === '\\overrightarrow'))
        );
      })
    ) {
      return true;
    }
  });
  if (startIndex === -1) {
    return shape(input);
  } else {
    const endIndex = input
      .slice(startIndex, input.length)
      .findIndex((e, i, a) => {
        return !(() => {
          let id = a.slice(i + 1, a.length).findIndex(f => {
            return f.type === 'atom';
          });
          id = id === -1 ? a.length : id + i + 1;
          if (
            a.slice(i, id).some(g => {
              return (
                (g.type === 'leftright' && g.body[0].type === 'array') ||
                (g.type === 'accent' &&
                  (g.label === '\\vec' || g.label === '\\overrightarrow'))
              );
            })
          ) {
            return true;
          }
        })();
      });
    if (endIndex === -1) {
      return Array.isArray(
        matrixCalculation(
          shape(input.slice(0, startIndex)),
          input.slice(startIndex, input.length)
        )
      )
        ? (() => {
            const element = input
              .slice(0, startIndex)
              .reverse()
              .find(e => {
                return e.type === 'atom' && e.text === '=';
              });
            const index =
              input.slice(0, startIndex).findIndex(e => e === element) + 1;
            return `${shape(input.slice(0, index))}[${matrixCalculation(
              shape(input.slice(index, startIndex)),
              input.slice(startIndex, input.length)
            )}]`;
          })()
        : (() => {
            const element = input
              .slice(0, startIndex)
              .reverse()
              .find(e => {
                return e.type === 'atom';
              });
            const index =
              input.slice(0, startIndex).findIndex(e => e === element) + 1;
            return `${shape(input.slice(0, index))}${matrixCalculation(
              shape(input.slice(index, startIndex)),
              input.slice(startIndex, input.length)
            )}`;
          })();
    } else {
      return `${(() => {
        const element = input
          .slice(0, startIndex)
          .reverse()
          .find(e => {
            return e.type === 'atom';
          });
        let index =
          input.slice(0, startIndex).findIndex(e => e === element) + 1;
        return `${shape(input.slice(0, index))}${matrixCalculation(
          shape(input.slice(index, startIndex)),
          input.slice(startIndex, endIndex + startIndex)
        )}`;
      })()}${(() => {
        return input.slice(endIndex + startIndex, input.length).some(e => {
          return e.type === 'leftright' && e.body[0].type === 'array';
        })
          ? matrixLeftRightShape(
              input.slice(endIndex + startIndex, input.length)
            )
          : shape(input.slice(endIndex + startIndex, input.length));
      })()}`;
    }
  }
};

vecShape = input => {
  let result = '';
  switch (input[0].type) {
    case 'accent':
      if (input.length > 1 && input[1].type === 'accent') {
        result = `${shape(
          input[0].base.body
        )}.reduce((pre,cur,i)=>pre+cur*${shape(input[1].base.body)}[i],0)${
          input.length > 2 ? vecShape(input.slice(2, input.length)) : ''
        }`;
      } else if (
        input.length > 1 &&
        input[1].type === 'leftright' &&
        input[1].type === 'array'
      ) {
        result = `${shape(
          input[0].base.body
        )}.reduce((pre,cur,i)=>pre+cur*${matrixLeftRightShape(input[1])}[i],0)${
          input.length > 2 ? vecShape(input.slice(2, input.length)) : ''
        }`;
      } else if (
        input.length > 2 &&
        input[1].type === 'atom' &&
        input[1].text === '\\cdot' &&
        input[2].type === 'accent'
      ) {
        result = `${shape(
          input[0].base.body
        )}.reduce((pre,cur,i)=>pre+cur*${shape(input[2].base.body)}[i],0)${
          input.length > 3 ? vecShape(input.slice(3, input.length)) : ''
        }`;
      } else if (
        input.length > 2 &&
        input[1].type === 'atom' &&
        input[1].text === '\\cdot' &&
        input[2].type === 'leftright' &&
        input[2].type === 'array'
      ) {
        result = `${shape(
          input[0].base.body
        )}.reduce((pre,cur,i)=>pre+cur*${matrixLeftRightShape(input[2])}[i],0)${
          input.length > 3 ? vecShape(input.slice(3, input.length)) : ''
        }`;
      } else {
        result = `${shape(input[0].base.body)}${
          input.length > 1 ? vecShape(input.slice(1, input.length)) : ''
        }`;
      }
      break;
    case 'atom':
      switch (input[0].text) {
        default:
          result = (() => {
            const startIndex = input.findIndex(e => {
              return e.type === 'accent';
            });
            if (
              input.length > startIndex + 1 &&
              input[startIndex + 1].type === 'accent'
            ) {
              return `${shape(input[0])}${vecShape(
                input.slice(1, startIndex + 2)
              )}${
                input.length > startIndex + 2
                  ? vecShape(input.slice(startIndex + 2, input.length))
                  : ''
              }`;
            } else if (
              input.length > startIndex + 2 &&
              input[startIndex + 1].type === 'atom' &&
              input[startIndex + 1].text === '\\cdot' &&
              input[startIndex + 2].type === 'accent'
            ) {
              return `${shape(input[0])}${vecShape(
                input.slice(1, startIndex + 3)
              )}${
                input.length > startIndex + 3
                  ? vecShape(input.slice(startIndex + 3, input.length))
                  : ''
              }`;
            } else {
              return `.map((e,i)=>e${shape(input[0])}${vecShape(
                input.slice(1, startIndex + 1)
              )}[i])${
                input.length > startIndex + 1
                  ? vecShape(input.slice(startIndex + 1, input.length))
                  : ''
              }`;
            }
          })();
          break;
      }
      break;
    default:
      result = (() => {
        const startIndex = input.findIndex(e => {
          return e.type === 'accent';
        });
        if (
          input.length > startIndex + 1 &&
          input[startIndex + 1].type === 'accent'
        ) {
          return `${shape(input.slice(0, startIndex))}${
            input[startIndex - 1].type !== 'atom' ? '*' : ''
          }${vecShape(input.slice(startIndex, startIndex + 2))}${
            input.length > startIndex + 2
              ? vecShape(input.slice(startIndex + 2, input.length))
              : ''
          }`;
        } else if (
          input.length > startIndex + 2 &&
          input[startIndex + 1].type === 'atom' &&
          input[startIndex + 1].text === '\\cdot' &&
          input[startIndex + 2].type === 'accent'
        ) {
          return `${shape(input.slice(0, startIndex))}${
            input[startIndex - 1].type !== 'atom' ? '*' : ''
          }${vecShape(input.slice(startIndex, startIndex + 3))}${
            input.length > startIndex + 3
              ? vecShape(input.slice(startIndex + 3, input.length))
              : ''
          }`;
        } else {
          return `${vecShape([input[startIndex]])}.map(e=>${shape(
            input.slice(0, startIndex)
          )}${input[startIndex - 1].type !== 'atom' ? '*' : ''}e)${
            input.length > startIndex + 1
              ? vecShape(input.slice(startIndex + 1, input.length))
              : ''
          }`;
        }
      })();
      break;
  }
  return result;
};

nextMulti = (input, num) => {
  return input.length > num
    ? (input[num].type !== 'atom' &&
      input[num].type !== 'punct' &&
      input[num].type !== 'bin' &&
      input[num].type !== 'spacing' &&
      !(input[num].type === 'textord' && input[num].text === '/')
        ? '*'
        : '') + shape(input.slice(num, input.length))
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
  if (
    input.some(e => {
      return e.type === 'atom' && e.text === '=';
    })
  ) {
    const index = input.findIndex(e => {
      return e.type === 'atom' && e.text === '=';
    });
    const frontEqual =
      input[0].type === 'accent' &&
      (input[0].label === '\\vec' || input[0].label === '\\overrightarrow')
        ? input[0].base.body
        : input.slice(0, index);
    const arrayIndex = frontEqual.findIndex(e => {
      return e.type === 'leftright' && e.left === '[' && e.right === ']';
    });
    if (
      frontEqual[frontEqual.length - 1].type === 'supsub' &&
      frontEqual[frontEqual.length - 1].hasOwnProperty('base') &&
      frontEqual[frontEqual.length - 1].hasOwnProperty('sub')
    ) {
      const variable =
        frontEqual.slice(0, frontEqual.length - 1).reduce((pre, cur) => {
          if (cur.hasOwnProperty('text')) {
            return pre + cur.text;
          } else if (cur.hasOwnProperty('name')) {
            return pre + cur.name.replace('\\', '');
          }
        }, '') + shape(frontEqual[frontEqual.length - 1].base);
      let array = `[${shape(frontEqual[frontEqual.length - 1].sub.body)}]`;
      array = array.replace(/,/g, '][');
      return codeSearchArray(code, variable)
        ? `${variable}${array}=${shape(input.slice(index + 1, input.length))}`
        : `${variable}${array}=${shape(input.slice(index + 1, input.length))}`;
    } else if (
      frontEqual[frontEqual.length - 1].type === 'leftright' &&
      frontEqual[frontEqual.length - 1].left === '(' &&
      frontEqual[frontEqual.length - 1].right === ')'
    ) {
      const variable = frontEqual
        .slice(0, frontEqual.length - 1)
        .reduce((pre, cur) => {
          if (cur.hasOwnProperty('text')) {
            return pre + cur.text;
          } else if (cur.hasOwnProperty('name')) {
            return pre + cur.name.replace('\\', '');
          }
        }, '');
      return `function ${variable}(${shape(
        frontEqual[frontEqual.length - 1].body
      )}){
                 return ${shape(input.slice(index + 1, input.length))};
              }`;
    } else if (arrayIndex === -1) {
      const variable = frontEqual.reduce((pre, cur) => {
        if (cur.hasOwnProperty('text')) {
          return pre + cur.text;
        } else if (cur.hasOwnProperty('name')) {
          return pre + cur.name.replace('\\', '');
        }
      }, '');
      return codeSearchVariable(code, variable)
        ? `${variable}=${shape(input.slice(index + 1, input.length))}`
        : `let ${variable}=${shape(input.slice(index + 1, input.length))}`;
    } else {
      const variable = frontEqual.slice(0, arrayIndex).reduce((pre, cur) => {
        if (cur.hasOwnProperty('text')) {
          return pre + cur.text;
        } else if (cur.hasOwnProperty('name')) {
          return pre + cur.name.replace('\\', '');
        }
      }, '');
      const array = frontEqual
        .slice(arrayIndex, frontEqual.length)
        .reduce((pre, cur) => {
          if (
            cur.type === 'leftright' &&
            cur.left === '[' &&
            cur.right === ']'
          ) {
            return `${pre}[${shape(cur.body)}]`;
          } else {
            return pre;
          }
        }, '');
      return codeSearchArray(code, variable)
        ? `${variable}${array}=${shape(input.slice(index + 1, input.length))}`
        : `${variable}${array}=${shape(input.slice(index + 1, input.length))}`;
    }
  }
  if (
    input.some(e => {
      return e.type === 'leftright' && e.body[0].type === 'array';
    })
  ) {
    return matrixLeftRightShape(input);
  }
  if (
    input.some(e => {
      return (
        e.type === 'accent' &&
        (e.label === '\\vec' || e.label === '\\overrightarrow')
      );
    })
  ) {
    return vecShape(input);
  }
  if (!input[0]) return '';
  switch (input[0].type) {
    case 'textord':
      result = (() => {
        if (input.length > 1) {
          if (isVector(input.slice(1, input.length))) {
            return `${shape(input.slice(1, input.length))}.map(e=>e*${
              input[0].text === '\\infty' ? Infinity : input[0].text
            })`;
          } else {
            return `${
              input[0].text === '\\infty' ? Infinity : input[0].text
            }${(input[1].type !== 'textord' &&
            input[1].type !== 'atom' &&
            input[1].type !== 'bin' &&
            input[1].type !== 'spacing' &&
            input[0].text !== '/'
              ? '*'
              : '') + shape(input.slice(1, input.length))}`;
          }
        } else {
          return input[0].text === '\\infty' ? 'Infinity' : input[0].text;
        }
      })();
      break;
    case 'mathord':
      result = (() => {
        if (input.length > 1) {
          let index = input.findIndex((e, i, a) => {
            return (
              (e.type !== 'mathord' &&
                e.type !== 'textord' &&
                !(
                  e.type == 'supsub' &&
                  e.sub &&
                  e.base &&
                  (e.base.type === 'mathord' || e.base.type === 'textord')
                )) ||
              (i > 0 &&
                a[i - 1].type == 'supsub' &&
                a[i - 1].sub &&
                a[i - 1].base &&
                (a[i - 1].base.type === 'mathord' ||
                  a[i - 1].base.type === 'textord'))
            );
          });
          let variable = '';
          index = index === -1 ? input.length : index;
          for (let i = index; i > 0; i--) {
            const vari = input.slice(0, i).reduce((pre, cur) => {
              return pre + (cur.type === 'supsub' ? cur.base.text : cur.text);
            }, '');
            if (codeSearchVariable(code, vari)) {
              variable = `${vari}${
                i < index ? '*' + shape(input.slice(i, index)) : ''
              }`;
              break;
            }
          }
          if (variable.length === 0) {
            return (() => {
              if (
                input[1].type === 'leftright' &&
                input[1].left === '[' &&
                input[1].right === ']'
              ) {
                return `${
                  input[0].text === '\\pi' ? `Math.PI` : input[0].text
                }${(() => {
                  let index = input.slice(1, input.length).findIndex(e => {
                    return !(
                      e.type === 'leftright' &&
                      e.left === '[' &&
                      e.right === ']'
                    );
                  });
                  index = index === -1 ? input.length - 1 : index;
                  if (codeSearchArray(code, input[0].text)) {
                    const array = input.slice(1, index + 1).map(e => {
                      return `[${shape(e.body)}]`;
                    });
                    return `${array.reduce((pre, cur) => {
                      return pre + cur;
                    })}${nextMulti(input, index + 1)}`;
                  } else {
                    const array = input.slice(1, index + 1).map(e => {
                      return `Math.floor(${shape(e.body)})`;
                    });
                    return `*${array.reduce((pre, cur) => {
                      return pre + '*' + cur;
                    })}${nextMulti(input, index + 1)}`;
                  }
                })()}`;
              } else {
                if (isVector(input.slice(1, input.length))) {
                  return `${shape(input.slice(1, input.length))}.map(e=>{
                    return e*${
                      input[0].text === '\\pi' ? `Math.PI` : input[0].text
                    };
                  })`;
                } else {
                  return `${
                    input[0].text === '\\pi' ? `Math.PI` : input[0].text
                  }${(input[1].type !== 'atom' &&
                  input[1].type !== 'punct' &&
                  input[1].type !== 'bin' &&
                  input[1].type !== 'spacing' &&
                  (input[1].type === 'leftright'
                    ? !codeSearchFunction(code, input[0].text)
                    : true)
                    ? `*`
                    : ``) + shape(input.slice(1, input.length))}`;
                }
              }
            })();
          } else if (input.length === index) {
            return input[input.length - 1].type === 'supsub' &&
              input[input.length - 1].sub &&
              input[input.length - 1].base &&
              (input[input.length - 1].base.type === 'mathord' ||
                input[input.length - 1].base.type === 'textord')
              ? (() => {
                  let array = `[${shape(input[input.length - 1].sub.body)}]`;
                  array = array.replace(/,/g, '][');
                  return codeSearchArray(code, variable)
                    ? `${variable}`
                    : `${variable}`;
                })()
              : variable;
          } else {
            return (() => {
              if (
                input[index].type === 'leftright' &&
                input[index].left === '[' &&
                input[index].right === ']'
              ) {
                return `${
                  input[index - 1].type === 'supsub' &&
                  input[index - 1].sub &&
                  input[index - 1].base &&
                  (input[index - 1].base.type === 'mathord' ||
                    input[index - 1].base.type === 'textord')
                    ? (() => {
                        let array = `[${shape(input[index - 1].sub.body)}]`;
                        array = array.replace(/,/g, '][');
                        return codeSearchArray(code, variable)
                          ? `${variable}`
                          : `${variable}`;
                      })()
                    : variable
                }${(() => {
                  let arrayIndex = input
                    .slice(index, input.length)
                    .findIndex(e => {
                      return !(
                        e.type === 'leftright' &&
                        e.left === '[' &&
                        e.right === ']'
                      );
                    });
                  arrayIndex =
                    arrayIndex === -1 ? input.length - 1 : arrayIndex;
                  if (codeSearchArray(code, variable)) {
                    const array = input
                      .slice(index, index + arrayIndex)
                      .map(e => {
                        return `[${shape(e.body)}]`;
                      });
                    return `${array.reduce((pre, cur) => {
                      return pre + cur;
                    })}${nextMulti(input, index + arrayIndex)}`;
                  } else {
                    const array = input
                      .slice(index, index + arrayIndex)
                      .map(e => {
                        return `Math.floor(${shape(e.body)})`;
                      });
                    return `*${array.reduce((pre, cur) => {
                      return pre + '*' + cur;
                    })}${nextMulti(input, index + arrayIndex)}`;
                  }
                })()}`;
              } else {
                if (isVector(input.slice(index, input.length))) {
                  return `${shape(input.slice(index, input.length))}.map(e=>e*${
                    input[index - 1].type === 'supsub' &&
                    input[index - 1].sub &&
                    input[index - 1].base &&
                    (input[index - 1].base.type === 'mathord' ||
                      input[index - 1].base.type === 'textord')
                      ? (() => {
                          let array = `[${shape(input[index - 1].sub.body)}]`;
                          array = array.replace(/,/g, '][');
                          return codeSearchArray(code, variable)
                            ? `${variable}`
                            : `${variable}`;
                        })()
                      : variable
                  })`;
                } else {
                  return `${
                    input[index - 1].type === 'supsub' &&
                    input[index - 1].sub &&
                    input[index - 1].base &&
                    (input[index - 1].base.type === 'mathord' ||
                      input[index - 1].base.type === 'textord')
                      ? (() => {
                          let array = `[${shape(input[index - 1].sub.body)}]`;
                          array = array.replace(/,/g, '][');
                          return codeSearchArray(code, variable)
                            ? `${variable}`
                            : `${variable}`;
                        })()
                      : variable
                  }${(input[index].type !== 'atom' &&
                  input[index].type !== 'punct' &&
                  input[index].type !== 'bin' &&
                  input[index].type !== 'spacing' &&
                  (input[index].type === 'leftright'
                    ? !codeSearchFunction(code, variable)
                    : true)
                    ? `*`
                    : ``) + shape(input.slice(index, input.length))}`;
                }
              }
            })();
          }
        } else {
          return input[0].text === '\\pi' ? `Math.PI` : input[0].text;
        }
      })();
      break;
    case 'spacing':
      result = `],[${
        input.length > 1 ? shape(input.slice(1, input.length)) : ''
      }`;
      break;
    case 'styling':
      result = shape(input[0].body);
      break;
    case 'atom':
      switch (input[0].text) {
        case '\\cdot':
          result = '*';
          break;
        case '\\times':
          result = '*';
          break;
        case '\\div':
          result = '/';
          break;
        default:
          result = input[0].text;
          break;
      }
      result += input.length > 1 ? shape(input.slice(1, input.length)) : ``;
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
      result = isVector(input.slice(1, input.length))
        ? `${shape(input.slice(1, input.length))}.map(e=>e*${radix(input[0])})`
        : `${radix(input[0])}${nextMulti(input, 1)}`;
      break;
    case 'leftright':
      result = leftright(input);
      break;
    case 'array':
      input = input[0].body[0][0].body[0].body;
      result = matrixLeftRightShape(input);
      break;
    case 'genfrac':
      result = isVector(input.slice(1, input.length))
        ? `${shape(input.slice(1, input.length))}.map(e=>e*${frac(input[0])})`
        : `${frac(input[0])}${nextMulti(input, 1)}`;
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
          result = isVector(input.slice(2, input.length))
            ? `${shape(input.slice(2, input.length))}.map(e=>e*${sin(
                input[1]
              )})`
            : `${sin(input[1])}${nextMulti(input, 2)}`;
          break;
        case '\\cos':
          result = isVector(input.slice(2, input.length))
            ? `${shape(input.slice(2, input.length))}.map(e=>e*${cos(
                input[1]
              )})`
            : `${cos(input[1])}${nextMulti(input, 2)}`;
          break;
        case '\\tan':
          result = isVector(input.slice(2, input.length))
            ? `${shape(input.slice(2, input.length))}.map(e=>e*${tan(
                input[1]
              )})`
            : `${tan(input[1])}${nextMulti(input, 2)}`;
          break;
        case '\\log':
          result = isVector(input.slice(2, input.length))
            ? `${shape(input.slice(2, input.length))}.map(e=>e*${naturalLog(
                input[1]
              )})`
            : `${naturalLog(input[1])}${nextMulti(input, 2)}`;
          break;
        case '\\int':
          const deltaIndex = input.findIndex(e => {
            return e.type === 'mathord' && e.text === 'd';
          });
          result = isVector(input.slice(deltaIndex + 2, input.length))
            ? `${shape(
                input.slice(deltaIndex + 2, input.length)
              )}.map(e=>e*${indefiniteIntegral(input, deltaIndex)})`
            : `${indefiniteIntegral(input, deltaIndex)}${nextMulti(input, 2)}`;
          break;
        default:
          break;
      }
      break;
    case 'supsub':
      if (input[0].sub) {
        switch (input[0].base.name) {
          case '\\log':
            result = isVector(input.slice(2, input.length))
              ? `${shape(input.slice(2, input.length))}.map(e=>e*${log(input)})`
              : `${log(input)}${nextMulti(input, 2)}`;
            break;
          case '\\sum':
            result = isVector(input.slice(2, input.length))
              ? `${shape(input.slice(2, input.length))}.map(e=>e*${sum(input)})`
              : `${sum(input)}${nextMulti(input, 2)}`;
            break;
          case '\\int':
            const deltaIndex = input.findIndex(e => {
              return e.type === 'mathord' && e.text === 'd';
            });
            result = isVector(input.slice(deltaIndex + 2, input.length))
              ? `${shape(
                  input.slice(deltaIndex + 2, input.length)
                )}.map(e=>e*${definiteIntegral(input, deltaIndex)})`
              : `${definiteIntegral(input, deltaIndex)}${nextMulti(input, 2)}`;
            break;
          case '\\lim':
            result = isVector(input.slice(2, input.length))
              ? `${shape(input.slice(2, input.length))}.map(e=>e*${limit(
                  input
                )})`
              : `${limit(input)}${nextMulti(input, 2)}`;
            break;
          default:
            let elementIndex = `[${shape(input[0].sub.body)}]`;
            elementIndex = elementIndex.replace(/,/g, '][');
            result = isVector(input.slice(1, input.length))
              ? `${shape(input.slice(1, input.length))}.map(e=>e*${shape(
                  input[0].base
                )}${elementIndex})`
              : `${shape(input[0].base)}${elementIndex}${nextMulti(input, 1)}`;
            break;
        }
      } else {
        if (input[0].sup.body[0].text === '\\prime') {
          result = isVector(input.slice(1, input.length))
            ? `${shape(input.slice(1, input.length))}.map(e=>e*${differential(
                input[0]
              )})`
            : `${differential(input[0])}${nextMulti(input, 1)}`;
        } else {
          result = isVector(input.slice(1, input.length))
            ? `${shape(input.slice(1, input.length))}.map(e=>e*${pow(
                input[0]
              )})`
            : `${pow(input[0])}${nextMulti(input, 1)}`;
        }
      }
      break;
    default:
      result = `${input[0]}${nextMulti(input, 1)}`;
      break;
  }
  return result;
};

export default (latex2js = (input, program) => {
  code = program;
  while (input.search(/\n/) >= 0) {
    input = input.replace(/\n/g, ' ');
  }
  const parseTree = katex.__parse(input);
  console.log(parseTree);
  return shape(parseTree, code);
});
