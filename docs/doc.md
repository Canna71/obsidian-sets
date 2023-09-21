# Obsidian Sets

This plugin is currently under development

This plugins is inspired by Notion and AnyType and implements a way to strucure data using obsidian notes, specifically the recently released properies.

In short, this plugin consists of:
- the usage of metadata properties to store data
- a query engine that allows to select items based on their properties
- visualizations of items using different layouts
- some "pre configured" usage like Sets and Collections

## Properties
Like other systems out there, we use notes as they were "objects" and use metadata properties to store attributes of those objects.
This plugin leverages the newly introduced properties in Obsidian `1.4.5`

### Property types
This plugin is using the same property types as Obsidian, plus might add its own, if enabled in the settings. At the moment the only additional type is `password`, which allows the storage of data that is not shown in the UI.

## Code Block

In order to instantiate a view to query your vault, you enter a code block like the following:


~~~yaml
```sets
```
~~~

Then everything is editable using the GUI. The first thing you will have to select, though is a *Scope*.

## Scope

A scope is *where* the query will look for items. There are 4 scopes:

- `Type`: items are restricted to a given type.
- `Collection`: items are restricted to a given collection.
- `Folder`: items are restricted to a given folder.
- `Vault`: items can be anywhere in the vault.

# Types

A type is a set of items that share the same properties. In other words, a type is a set of items that can be described by the same set of properties. 

You create a type by using the command `Sets: Create a new type`. 
It will ask you a name:

![Alt text](image-2.png)

After you click save, it will create the following:
- a note with the name you provided plus a suffix (By default `Type`). This will be the archetype for items of this type. Think of it as a template.
- This note will have a property `type` with the value you provided.
- A folder with the same name as the note - plus a suffix (by default `Set`), where  items of this type could be stored.
- A note, in the folder above, with the same name as the folder, that will display the items of this type.

You will then need to add properties to the type. You can do this by adding properties to the note that represent the type. 
Remember that when you create a new property, or assign a type, this will be valid for the entire vault.

If you go to the Set folder that was created, you will see a note with the same name as the folder. This note will display all items of this type in the vault.

In order to display items of this type in a different note, you can create a view, by adding a code block as descibed above, and then specifying the scope as `Type` and the type as the one you just created.

![Alt text](image.png)

More on queries and views later.

# Collections

A collection is a set of items that are explicitely added to it. In other words, a collection is a set of items that are not necessarily of the same type, but that are explicitely added to it.

You create a collection by using the command `Sets: Create a new collection`.
It will ask you a name:

![Alt text](image-1.png)

After you click save, it will create the following:
- a note with the name you provided. 
- This note will have a `type` `collection` even if this is only marginal
- This note will contain a view that will display all items of this collection.

You will then need to add items to the collection. 
To do so, you can right click on the explorer or in the file menu and select `Add to collection` or use the command `Sets: Add to collection` [TODO]

In order to display items of this collection in a different note, you can create a view, by adding a code block as descibed above, and then specifying the scope as `Collection` and the collection as the one you just created.

## Structured data

Sets uses metadata properties to store data. 

## Set
A set is caracterized by objects of the same `type`

## Collection
A collection is cracterized by objects explicitely added to it.

# Views

In order to access and manage items a view can be added to any page.

A view consists of the following:

## Scope

`type`: items are restricted to a given typw.
`collection`: items are restricted to a given collection.
`folder`: items are restricted to a given folder.
`value`: items can be anywhere

## Filter

A filter can be applied to the view. Filter are boolean expression that can be combined using logical operators.

## Sort

Sort is used to order items in the view. It is a list of properties and directions.

## Fields

Fields are used to select which properties are shown in the view. It is a list of properties.

# Creating a new Type

From the side bar, from a command, or from a view.
The new type consists of a note, that will act as the "template" for items of the same type.

# Adding an item to a collection

Right clicking on the explorer or in the menu.
