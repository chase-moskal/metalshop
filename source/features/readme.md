
# metalshop features readme

## anatomy of an example feature

`features/todo/`
- "readme.md" — notes about a particular feature, please list dependencies
- "todo-types.ts" — all typescript types 'owned' by the feature
- "todo-business.ts" — microservice business logic topic implementation
- "todo-model.ts" — frontend state and actions
- "todo.css.ts" — frontend styles for the components
- "metal-todo.ts" — frontend web component
- "metal-todo-item.ts" — frontend web component

## how features work

- remember that features interact, and may depend on other features
