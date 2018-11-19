const katex = require('katex');
const mathjs = require('mathjs');
const mathIntegral = require('mathjs-simple-integral');
const atl = require('asciimath-to-latex');
const acorn = require('acorn');

let code = '';
mathjs.import(mathIntegral);
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
  codeSearch,
  codeSearchArray,
  splitCodeClose,
  vecShape;

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
    return (
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
      })()}`
    );
  } else if (splitCode.split('(').length < splitCode.split(')').length) {
    return (
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
      })()}` + splitCode
    );
  }

  return splitCode;
};
codeSearch = (code, variable) => {
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

frac = input => {
  return `((${shape(input.numer.body)})/(${shape(input.denom.body)}))`;
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
  return input.type === 'leftright'
    ? `Math.sin${shape(input)}`
    : `Math.sin(${shape(input)})`;
};

cos = input => {
  return input.type === 'leftright'
    ? `Math.cos${shape(input)}`
    : `Math.cos(${shape(input)})`;
};

tan = input => {
  return input.type === 'leftright'
    ? `Math.tan${shape(input)}`
    : `Math.tan(${shape(input)})`;
};

leftright = input => {
  if (input.left === '[' && input.right === ']') {
    return `Math.floor(${shape(input.body)})`;
  } else if (input.left === '|' && input.right === '|') {
    if (
      input.body[0].type === 'leftright' &&
      input.body[0].body[0].type === 'array'
    ) {
      return `[${matrix(input.body[0])}].reduce((pre,cur)=>{
        return pre+Math.pow(cur,2)
      },0)`;
    } else if (
      input.body[0].type === 'accent' &&
      (input.body[0].label === '\\vec' ||
        input.body[0].label === '\\overrightarrow')
    ) {
      return `${shape(input.body[0])}.reduce((pre,cur)=>{
        return pre+Math.pow(cur,2)
      },0)`;
    } else {
      return `Math.abs(${shape(input.body)})`;
    }
  }
  return `(${shape(input.body)})`;
};

naturalLog = input => {
  return input.type === 'leftright'
    ? `Math.log${shape(input)}`
    : `Math.log(${shape(input)})`;
};

log = input => {
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
  return `((${val}=>{return ${latex2js(
    atl(mathjs.integral(expression, val).toString())
  )}})(${end})-(${val}=>{return ${latex2js(
    atl(mathjs.integral(expression, val).toString())
  )}})(${start}))`;
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
      if (array === '') return input[1];
      return input[1].map(e => {
        return e.map(f => {
          return `(${input[0]}*${f})`;
        });
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
  if (!input[0]) return array;
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
            let index =
              input.slice(1, input.length).findIndex(e => {
                return !(
                  (e.type === 'leftright' && e.body[0].type === 'array') ||
                  (e.type === 'accent' &&
                    (e.label === '\\vec' || e.label === '\\overrightarrow'))
                );
              }) + 1;
            index = index === 0 ? input.length : index;
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
                        matrixLeftRightShape(input.slice(1, index)),
                        input[0].text
                      ),
                      input.slice(index, input.length)
                    )
                  : matrixOperations(
                      array,
                      matrixLeftRightShape(input.slice(1, index)),
                      input[0].text
                    );
              })();
            }
          })();
          break;
      }
      break;
    default:
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
  const startIndex = input.findIndex(e => {
    return (
      (e.type === 'leftright' && e.body[0].type === 'array') ||
      (e.type === 'accent' &&
        (e.label === '\\vec' || e.label === '\\overrightarrow'))
    );
  });
  if (startIndex === -1) {
    return shape(input);
  } else {
    const endIndex = input
      .slice(startIndex, input.length)
      .findIndex((e, i, a) => {
        return (
          !(
            (e.type === 'leftright' && e.body[0].type === 'array') ||
            (e.type === 'accent' &&
              (e.label === '\\vec' || e.label === '\\overrightarrow'))
          ) &&
          !(
            (e.type === 'atom' &&
              (a[i + 1] &&
                a[i + 1].type === 'leftright' &&
                a[i + 1].body[0].type === 'array')) ||
            (a[i + 1].type === 'accent' &&
              (a[i + 1].label === '\\vec' ||
                a[i + 1].label === '\\overrightarrow'))
          )
        );
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
        const index =
          input.slice(0, startIndex).findIndex(e => e === element) + 1;
        return `${shape(input.slice(0, index))}${matrixCalculation(
          shape(input.slice(index, startIndex)),
          input.slice(startIndex, endIndex + startIndex)
        )}`;
      })()}${
        input.slice(endIndex + startIndex, input.length).some(e => {
          return e.type === 'leftright' && e.body[0].type === 'array';
        })
          ? matrixLeftRightShape(
              input.slice(endIndex + startIndex, input.length)
            )
          : shape(input.slice(endIndex + startIndex, input.length))
      }`;
    }
  }
};

vecShape = input => {
  let result = '';
  switch (input[0].type) {
    case 'accent':
      if (input.length > 1 && input[1].type === 'accent') {
        result = `${shape(input[0].base.body)}.reduce((pre,cur,i)=>{
        return pre+cur*${shape(input[1].base.body)}[i];
      },0)${input.length > 2 ? vecShape(input.slice(2, input.length)) : ''}`;
      } else if (
        input.length > 1 &&
        input[1].type === 'leftright' &&
        input[1].type === 'array'
      ) {
        result = `${shape(input[0].base.body)}.reduce((pre,cur,i)=>{
          return pre+cur*${matrixLeftRightShape(input[1])}[i];
        },0)${input.length > 2 ? vecShape(input.slice(2, input.length)) : ''}`;
      } else if (
        input.length > 2 &&
        input[1].type === 'atom' &&
        input[1].text === '\\cdot' &&
        input[2].type === 'accent'
      ) {
        result = `${shape(input[0].base.body)}.reduce((pre,cur,i)=>{
        return pre+cur*${shape(input[2].base.body)}[i];
      },0)${input.length > 3 ? vecShape(input.slice(3, input.length)) : ''}`;
      } else if (
        input.length > 2 &&
        input[1].type === 'atom' &&
        input[1].text === '\\cdot' &&
        input[2].type === 'leftright' &&
        input[2].type === 'array'
      ) {
        result = `${shape(input[0].base.body)}.reduce((pre,cur,i)=>{
        return pre+cur*${matrixLeftRightShape(input[2])}[i];
      },0)${input.length > 3 ? vecShape(input.slice(3, input.length)) : ''}`;
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
              return `.map((e,i)=>{
                return e${shape(input[0])}${vecShape(
                input.slice(1, startIndex + 1)
              )}[i]
              })${
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
          return `${vecShape([input[startIndex]])}.map(e=>{
            return ${shape(input.slice(0, startIndex))}${
            input[startIndex - 1].type !== 'atom' ? '*' : ''
          }e;
          })${
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
          return pre + cur.text;
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
          return pre + cur.text;
        }, '');
      return `function ${variable}(${shape(
        frontEqual[frontEqual.length - 1].body
      )}){
        return ${shape(input.slice(index + 1, input.length))}
      }`;
    } else if (arrayIndex === -1) {
      const variable = frontEqual.reduce((pre, cur) => {
        return pre + cur.text;
      }, '');
      return codeSearch(code, variable)
        ? `${variable}=${shape(input.slice(index + 1, input.length))}`
        : `let ${variable}=${shape(input.slice(index + 1, input.length))}`;
    } else {
      const variable = frontEqual.slice(0, arrayIndex).reduce((pre, cur) => {
        return pre + cur.text;
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
      result = `${input[0].text === '\\infty' ? Infinity : input[0].text}${
        input.length > 1
          ? (input[1].type !== 'textord' &&
            input[1].type !== 'atom' &&
            input[1].type !== 'bin' &&
            input[1].type !== 'spacing' &&
            input[0].text !== '/'
              ? '*'
              : '') + shape(input.slice(1, input.length))
          : ``
      }`;
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
            if (codeSearch(code, vari)) {
              variable = `${vari}${
                i < index ? '*' + shape(input.slice(i, index)) : ''
              }`;
              break;
            }
          }
          if (variable.length === 0) {
            return `${input[0].text}${
              input[1].type === 'leftright' &&
              input[1].left === '[' &&
              input[1].right === ']'
                ? (() => {
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
                  })()
                : (input[1].type !== 'atom' &&
                  input[1].type !== 'punct' &&
                  input[1].type !== 'bin' &&
                  input[1].type !== 'spacing' &&
                  (input[1].type === 'leftright'
                    ? !codeSearch(code, input[0].text)
                    : true)
                    ? `*`
                    : ``) + shape(input.slice(1, input.length))
            }`;
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
            }${
              input[index].type === 'leftright' &&
              input[index].left === '[' &&
              input[index].right === ']'
                ? (() => {
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
                  })()
                : (input[index].type !== 'atom' &&
                  input[index].type !== 'punct' &&
                  input[index].type !== 'bin' &&
                  input[index].type !== 'spacing' &&
                  (input[index].type === 'leftright'
                    ? !codeSearch(code, variable)
                    : true)
                    ? `*`
                    : ``) + shape(input.slice(index, input.length))
            }`;
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
      result = `${radix(input[0])}${nextMulti(input, 1)}`;
      break;
    case 'leftright':
      result = `${leftright(input[0])}${nextMulti(input, 1)}`;
      break;
    case 'array':
      input = input[0].body[0][0].body[0].body;
      result = matrixLeftRightShape(input);
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
            result = `${sum(input)}${nextMulti(input, 2)}`;
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
            let elementIndex = `[${shape(input[0].sub.body)}]`;
            elementIndex = elementIndex.replace(/,/g, '][');
            result =
              `${shape(input[0].base)}${elementIndex}` + nextMulti(input, 1);
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

export default (latex2js = (input, program) => {
  code = program;
  while (input.search(/\n/) >= 0) {
    input = input.replace(/\n/g, ' ');
  }
  const parseTree = katex.__parse(input);
  return shape(parseTree, code);
});
