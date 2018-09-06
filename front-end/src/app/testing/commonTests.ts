export function testHeaderLov(dataSource, headerLovColumns) {
  for (const item of dataSource.header) {
    if (headerLovColumns.includes(item.column)) {
      expect(item.filter.rowData$).not.toBe(undefined, `"${item.column}" column`);
    } else {
      expect(item.filter.rowData$).toBe(undefined, `"${item.column}" column`);
    }
  }
}
