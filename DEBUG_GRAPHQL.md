# Debug GraphQL "Expected Name, found <EOF>" Error

## Lỗi
```
GraphQLError: Syntax Error: Expected Name, found <EOF>.
```

## Nguyên nhân có thể:
1. Một GraphQL query/mutation có selection set rỗng: `{ }`
2. Field name bị thiếu sau dấu `{`
3. Trailing comma hoặc syntax error nhỏ
4. Query được export nhưng undefined

## Cách debug:

### Bước 1: Tắt từng phần queries/mutations
Tạm thời comment các export trong `src/lib/graphql/queries/index.ts` để tìm nhóm queries nào gây lỗi:

```typescript
// Comment từng section một
export * from './student'
// export * from './teacher'  // Comment để test
// export * from './admin'     // Comment để test
// export * from './department' // Comment để test
```

### Bước 2: Thu hẹp phạm vi
Khi tìm được section nào gây lỗi, comment từng file trong section đó.

### Bước 3: Tìm query cụ thể
Trong file gây lỗi, comment từng export:

```typescript
// export { GET_DEPARTMENT_TOPICS } from './topic.queries'
// export { GET_DEPARTMENT_COUNCILS } from './council.queries'
```

## Hoặc: Kiểm tra từng file manually

Chạy lệnh này để validate từng query file:

```bash
for file in src/lib/graphql/queries/department/*.ts; do
  echo "Testing $file..."
  node -e "
    try {
      require('./$file');
      console.log('✓ OK');
    } catch(e) {
      console.log('✗ ERROR:', e.message);
    }
  "
done
```
