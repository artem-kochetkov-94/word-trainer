export const removeCharacterAtIndex = (str: string, index: number): string => {
  if (index < 0 || index >= str.length) {
    return str; // Возвращаем исходную строку, если индекс некорректный
  }

  return str.substring(0, index) + str.substring(index + 1);
}
