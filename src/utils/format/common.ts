import JSON5 from "json5";

type AnyObject = Record<string, any>;
/**
 * 深度宽松解析JSON数据
 * @param input 待解析JSON
 * @returns object或者解析失败的对象
 */
export function deepSmartParse<T = any>(input: any): T {
  function tryParse(value: any): any {
    if (typeof value !== "string") return value;
    // 先尝试标准 JSON
    try {
      return deepSmartParse(JSON.parse(value));
    } catch {}
    // 再尝试 JSON5（支持宽松格式）
    try {
      return deepSmartParse(JSON5.parse(value));
    } catch {}
    return value;
  }
  if (Array.isArray(input)) {
    return input.map(tryParse) as any;
  } else if (typeof input === "object" && input !== null) {
    const result: AnyObject = {};
    for (const key in input) {
      result[key] = tryParse(input[key]);
    }
    return result as T;
  }
  return tryParse(input);
}

/**
 * 按照 某个字符 分隔字符串但排除在两边有引号内的x
 * @param path 分隔的字符串
 * @param separator 分隔字符，默认是'.'
 * @returns 分隔后的string[]
 */
export function smartSplit(path: string, separator: string = '.'): string[] {
  const result: string[] = [];
  const stripQuotes = (value: string): string => {
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      return value.slice(1, -1);
    }
    return value;
  };
  let current = "";
  let inQuotes = false;
  let quoteChar = "";
  for (let i = 0; i < path.length; i++) {
    const char = path[i];

    if (char === "'" || char === '"') {
      if (inQuotes && char === quoteChar) {
        inQuotes = false;
        quoteChar = "";
      } else if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      }
      current += char;
    } else if (char === separator && !inQuotes) {
      result.push(stripQuotes(current));
      current = "";
    } else {
      current += char;
    }
  }
  if (current) result.push(stripQuotes(current));
  return result;
}
