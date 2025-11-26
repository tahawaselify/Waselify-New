// Allow importing .lottie files
declare module '*.lottie' {
  const content: string;
  export default content;
}

// Allow importing .json files
declare module '*.json' {
  const content: any;
  export default content;
}
