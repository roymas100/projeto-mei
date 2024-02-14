import { isValid, parse } from "date-fns";

const teste = parse('Mon', 'eee', new Date())

console.log(teste, isValid(teste))