// Tokenization constants \\

const TOKENS = {
    NUM: "NUM",
    PLUS: "+",
    MINUS: "-",
    MULTIPLY: "*",
    DIVIDE: "/",
    LPAREN: "(",
    RPAREN: ")",
    EXP: "^",
    
    
    ILLEGAL: "ILLEGAL",
    EOF: "EOF"
};

class Token {
    constructor(type, value=null) {
        this.tokenType = type;
        this.value = value;
    }
}

Object.freeze(TOKENS);

const DIGITS = /\d/;


// Parsing definitions \\

class Node {
    constructor(value=null, left=null, right=null) {
        this.left = left;
        this.value = value;
        this.right = right;
    }
}

const input = readLine("Input your expression: \n");

const tokens = lexer(input)
const ast = parser(tokens)
const answer = interpreter(ast);

// console.log(ast)
console.log(answer)



function lexer(input) {
    let tokens =  []
    let ptr = 0;
    
    function addToken(token, value=null) {
        tokens.push(new Token(token, value))
        
        advance();
    }
    
    function peek() {
        return input[ptr];
    }
    function advance() {
        let current = peek();
        ptr++;
        return current;
    }
    
    // let trackingDigit = false;
    // let trackedNum = ""
    
    while (ptr <  input.length) {
        switch (true) {
            case [
                TOKENS.PLUS,
                TOKENS.MINUS,
                TOKENS.MULTIPLY,
                TOKENS.DIVIDE,
                TOKENS.LPAREN,
                TOKENS.RPAREN,
                TOKENS.EXP
            ].includes(peek()):
                addToken(peek());
                break;
            
            case DIGITS.test(peek()):
                let number = "";
                let decimal = false;
                while (DIGITS.test(peek()) || peek() == ".") {
                    if (peek() == ".") {
                        if (decimal) throw new SyntaxError("You cant have two decimals you [REDACTED]");
                        
                        decimal = true;
                    }
                    number += advance();
                }
                

                tokens.push(new Token(TOKENS.NUM, decimal ? parseFloat(number) : parseInt(number)))
                break;
            
            case peek() == " ":
                advance();
                break;
            default: 
                addToken(TOKENS.ILLEGAL)
                break;
        }
    }
    
    addToken(TOKENS.EOF);
    return tokens;
}
function parser(tokens) {
    let ptr = 0;
    
    function read() {
        const current = tokens[ptr];
        ptr++;
        return current;
    }
    function peek() {
        return tokens[ptr].tokenType;
    }
    function eat(tokenTypes) {
        if (!tokenTypes.includes(peek()))  throw new SyntaxError("Syntax error son");
        
        return read().tokenType;
    }
    
    function expression() {
        let left = term();
        
        while ([TOKENS.PLUS, TOKENS.MINUS].includes(peek())) {
            let op = peek();
            
            eat([TOKENS.PLUS, TOKENS.MINUS]);
            
            let right = term();
            
            left = new Node(op, left, right)
        }
        return left;
    }
    function term() {
        let left = unary();
        
        while ([TOKENS.MULTIPLY, TOKENS.DIVIDE].includes(peek())) {
            let op = peek();
            
            eat([TOKENS.MULTIPLY, TOKENS.DIVIDE]);
            
            let right = unary();
            
            left = new Node(op, left, right)
        }
        return left;
    }
    function unary() {
        let result
        let sign;
        
        if ([TOKENS.PLUS, TOKENS.MINUS].includes(peek())) {
            sign = peek();
            eat([peek()]);
            result = unary()
            
            return new Node(sign, null, result)
        } else {
            return exponent();
        }
        
        
            
        
    }
    function exponent() {
        let left = factor();
        
        if ([TOKENS.EXP].includes(peek())) {
            eat([peek()]);
            
            let right = unary();
            left = new Node(TOKENS.EXP, left, right);
            
        }
        return left;
        
    }
    function factor() {
        let value;
        if (peek() == TOKENS.NUM) {
            value = tokens[ptr].value;
            ptr++;
        } else if (peek() == TOKENS.LPAREN) {
            eat([TOKENS.LPAREN])

            let inner = expression();
            
            eat([TOKENS.RPAREN]);

            
            return inner;
              
        } else 
            throw new SyntaxError("Syntax Error, unexpected " + peek() + " at " + ptr);
        
        
        return new Node(value);
    }
    
    
    
    
    let AST = expression()
    eat([TOKENS.EOF]);
    return AST;
}
function interpreter(ast) {
    function evaluate(node) {
        let current = node.value;
        
        if (typeof current == "number") {
            return current;
        } else {
            if (node.left == null) {
                switch (current) {
                    case TOKENS.PLUS: 
                        return evaluate(node.right);
                    case TOKENS.MINUS:
                        return -evaluate(node.right);
                }
            } else {
                
                let left = evaluate(node.left);
                let right = evaluate(node.right);
    
                switch (current) {
                    case TOKENS.PLUS:
                        return left + right;
                        break;
                    case TOKENS.MINUS:
                        return left - right;
                        break;
                    case TOKENS.MULTIPLY:
                        return left * right;
                        break;
                    case TOKENS.DIVIDE:
                        return left / right;
                        break; 
                    case TOKENS.EXP:
                        return left ** right;
                        break;
                }
            }
        }
        
        
     }
    
    return evaluate(ast);
}