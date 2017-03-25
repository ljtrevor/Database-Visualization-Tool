angular.module('visualizeCtrl', ['visualizeService'])
   .controller('visualizeController', ['$scope', '$location', 'Visualize',
    function($scope, $location, Visualize) {

    $scope.ERToggle = true;
    $scope.databaseInfo = Visualize.getDatabaseInfo();
    $scope.databaseObject = Visualize.getDatabaseObject();

    $scope.conceptualTablesList = [];
    $scope.conceptualEntitiesList = [];

    var make = go.GraphObject.make;

/**********Clustering Algorithm Beginning****************************************************************************/

/*
OrderAscPk(S):
given a set of relations S, returns a list with the relations ordered such that the
two following properties hold:

1. ascending order regarding the cardinality of the primary keys (=rst relations
with 1 attribute in the primary key, then with 2, and so on);

2. relations having the same primary key are in consecutive positions in the
list.
pk(R): denotes the primary key of relation R

*/

// takes in dattabaseObject and gives an ordered list like {tableName: "table1", numOfPK: 0, tableName: "table2", numOfPK: 1}
getTableAndPK = function(s){
    table_list = [];

    for (i = 0; i < s.tables.length; i++) {
      if (typeof s.tables[i].primary_keys !== "undefined") {
            table_list.push({ tableName: s.tables[i].table_name, numOfPK: s.tables[i].primary_keys.length, PK: obj_stringify(s.tables[i].primary_keys).sort()} )
          }
       else {
        table_list.push({ tableName: s.tables[i].table_name, numOfPK: 0, PK: null})
       }
      }



   for ( var i = (table_list.length - 1); i >= 0; i--) {
      for ( var j = 1; j <= i; j++) {
         if (table_list[j-1].PK > table_list[j].PK) {
              var temp = table_list[j-1];
              table_list[j-1] = table_list[j];
              table_list[j] = temp;
   } } }

    for ( var i = (table_list.length - 1); i >= 0; i--) {
      for ( var j = 1; j <= i; j++) {
         if (table_list[j-1].numOfPK > table_list[j].numOfPK) {
              var temp = table_list[j-1];
              table_list[j-1] = table_list[j];
              table_list[j] = temp;
   } } }

          return table_list;
}

// used to stringify objects then place them in alphabetical order
obj_stringify = function(s){
  var r = [];
  for(var i = 0; i < s.length; i++) {
    r.push(JSON.stringify(s[i]));
  }
  return r;
}


// takes in set of tables and returns a list with tables ordered satisfying properties 1 and 2 (above).
orderAscPK = function(s) {
  table_list = getTableAndPK(s);
   return table_list;
 }


 // The Clustering Algorightm. Takes in the databaseobject
abstractER = function(rels){
// Steps 1 and 2
    var disjoint = false;
    var ordered_rels = orderAscPK(rels);
    var remainingRels = ordered_rels.slice();

    var cluster = [];
    for (var i in ordered_rels) {
      cluster.push([]);
        }



   cluster[0].push(ordered_rels[0]);
   remainingRels.shift();
    var nes = 1;

    for (var i = 1; i < ordered_rels.length; i++) {

      var relations = ordered_rels[i];

      if (JSON.stringify(relations.PK) === JSON.stringify(cluster[nes-1][0])) {
        cluster[nes-1].push(relations);
        remainingRels = remainingRels.filter(function (x) {return x.tableName !== relations.tableName});
      }
      else {
        disjoint = true;
        for(var s = 0; s < nes; s++ ) {
          if (sharedPK(relations,cluster[s]) == true) {
            disjoint = false;
          }
        }

      if (disjoint == true) {
        cluster[nes].push(relations);
        nes = nes + 1;
        remainingRels = remainingRels.filter(function (x) {return x.tableName !== relations.tableName});
      }
    }
  }


// Step 3
for (var r = 0; r < remainingRels.length; r++) {
      var relation = remainingRels[r];
      var i = 0;
      var clustered = false;

     while (i < nes && !clustered) {
        if (sharedPK(relation, cluster[i])) {
          for(var j = 0; j < nes; j++){
            if(j != i){
              if(sharedPK(relation,cluster[j]) ) {
                break;
              } else if (j == nes - 1) {
                cluster[i-1].push(relation);
                remainingRels = remainingRels.filter(function (x) {return x.tableName !== relation.tableName});
                r--;
                clustered = true;
              }
            }

          }

        }
        i++;
      }
    }


// step 4 of algorithm

    var argument = [];
    var intersects = [];
    var nas = 0;
    var first_relationship = true;



     for (var i = 0; i < cluster.length; i++) {
            argument.push([]);
            for (var j = 0; j < nes; j++) {
                argument[i].push(false);
                if (i === 0) {
                    intersects.push(false);
                }
            }
        }

        for (var i in intersects) {
              intersects[i] = false;
            }

    for (var r = 0; r < remainingRels.length; r++) {
      var relation = remainingRels[r];

      for (var i in intersects) {
              intersects[i] = false;
            }

      for (var i = 0; i < nes; i++) {
        if (sharedPK(relation,cluster[i])) {
          intersects[i] = true;
        }
      }

      if (first_relationship) {
        for (var i = 0; i < nes; i++) {
          argument[0][i] = intersects[i];
        }
        cluster[nas+nes].push(relation);
        nas++;
        remainingRels = remainingRels.filter(function (x) {return x.tableName !== relation.tableName});
        r--;
        first_relationship = false;
      }
      else {
        var j = 0;
        var found = false;

          while (j < nas && !found) {
                    var checker = true;    // we 'and' intersects[i] == argument[j][i]

                    for (var i in intersects) {
                        if (intersects[i] !== argument[j][i]) {
                            checker = false;
                            break;
                        }
                    }

                    if (checker) {
                        cluster[nes + j].push(relation);
                         remainingRels = remainingRels.filter(function (x) {return x.tableName !== relation.tableName});
                        r--;
                        found = true;
                    }
                    j++;

                }


         if (!found) {
                    for (var i = 0; i < nes; i++) {
                        argument[nas][i] = intersects[i];
                    }
                    cluster[nas + nes].push(relation);
                    nas++;
                    remainingRels = remainingRels.filter(function (x) {return x.tableName !== relation.tableName});
                    r--;
                }
            }
        }




    var data = [cluster,nes, nas];
    return data;

}



sharedPK_help = function(relations,cluster){
  for(var i = 0; i < relations.PK.length; i++) {
  for(var j = 0; j < cluster.PK.length; j++) {
    if (JSON.stringify(relations.PK[i]) === JSON.stringify(cluster.PK[j])) {
      return true;
    }
  }
}
return false;
}


// Used to compare primary keys in the clustering algorithm
sharedPK = function(relation, cluster) {
  for(var i in cluster) {
    if (sharedPK_help(relation, cluster[i])) {
      return true;
    }
  }
  return false;
}


// used to get abstract entities (algorithm must have been called first)
getAbstractEntities = function(data){
  var nes = data[1];
  var nas = data[2];
  var cluster = data[0];
  cluster = cluster.slice(0,nes);
  return cluster;

}

// used to get abstract relationships (algorithm must have been called first)
getAbstractRelationships = function(data){
  var nes = data[1];
  var nas = data[2];
  var cluster = data[0];
  cluster = cluster.slice(nes,nes+nas);
  return cluster;
}




/***********Clustering Algorithm End**********************************************************************************************/

    // used to fill attributes of er diagram
    items = function(i){
      attributesArray = [];
      for (var j in $scope.databaseObject.tables[i].columns) {
        attributesArray.push({ name: $scope.databaseObject.tables[i].columns[j].column_name, iskey: true});
      }
      return attributesArray;
    }

    initializeER = function(diagramType) {

        if (diagramType == 0) {
          myERDiagram = make(go.Diagram, "myERDiagramDiv", {
              initialContentAlignment: go.Spot.Center,
              allowDelete: false,
              allowCopy: false,
              "undoManager.isEnabled": true
            });
        } else {
          myConceptualERDiagram = make(go.Diagram, "myConceptualERDiagramDiv", {
              initialContentAlignment: go.Spot.Center,
              allowDelete: false,
              allowCopy: false,
              "undoManager.isEnabled": true
            });
        }

        // define several shared Brushes
        var bluegrad = make(go.Brush, "Linear", { 0: "rgb(150, 150, 250)", 0.5: "rgb(86, 86, 186)", 1: "rgb(86, 86, 186)" });
        var greengrad = make(go.Brush, "Linear", { 0: "rgb(158, 209, 159)", 1: "rgb(67, 101, 56)" });
        var redgrad = make(go.Brush, "Linear", { 0: "rgb(206, 106, 100)", 1: "rgb(180, 56, 50)" });
        var yellowgrad = make(go.Brush, "Linear", { 0: "rgb(254, 221, 50)", 1: "rgb(254, 182, 50)" });
        var lightgrad = make(go.Brush, "Linear", { 1: "#E6E6FA", 0: "#FFFAF0" });

        // the template for each attribute in a node's array of item data
        var itemTempl =
          make(go.Panel, "Horizontal",
            make(go.Shape,
              { desiredSize: new go.Size(10, 10) },
              new go.Binding("figure", "figure"),
              new go.Binding("fill", "color")),
            make(go.TextBlock,
              { stroke: "#333333",
                font: "bold 14px sans-serif" },
              new go.Binding("text", "name"))
          );


        var nodeDataArray = [];
        var linkDataArray = [];
        if (diagramType == 0) {
          // define the Node template, representing an entity
          myERDiagram.nodeTemplate =
            make(go.Node, "Auto",  // the whole node panel
              { selectionAdorned: true,
                resizable: true,
                layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
                fromSpot: go.Spot.AllSides,
                toSpot: go.Spot.AllSides,
                isShadowed: true,
                shadowColor: "#C5C1AA" },
              new go.Binding("location", "location").makeTwoWay(),
              // define the node's outer shape, which will surround the Table
              make(go.Shape, "Rectangle",
                { fill: lightgrad, stroke: "#756875", strokeWidth: 3 }),
              make(go.Panel, "Table",
                { margin: 8, stretch: go.GraphObject.Fill },
                make(go.RowColumnDefinition, { row: 0, sizing: go.RowColumnDefinition.None }),
                // the table header
                make(go.TextBlock,
                  {
                    row: 0, alignment: go.Spot.Center,
                    margin: new go.Margin(0, 14, 0, 2),  // leave room for Button
                    font: "bold 16px sans-serif"
                  },
                  new go.Binding("text", "key")),
                // the collapse/expand button
                make("PanelExpanderButton", "LIST",  // the name of the element whose visibility this button toggles
                  { row: 0, alignment: go.Spot.TopRight }),
                // the list of Panels, each showing an attribute
                make(go.Panel, "Vertical",
                  {
                    name: "LIST",
                    row: 1,
                    padding: 3,
                    alignment: go.Spot.TopLeft,
                    defaultAlignment: go.Spot.Left,
                    stretch: go.GraphObject.Horizontal,
                    itemTemplate: itemTempl
                  },
                  new go.Binding("itemArray", "items"))
              )  // end Table Panel
            );  // end Node

          // define the Link template, representing a relationship
          myERDiagram.linkTemplate =
            make(go.Link,  // the whole link panel
              {
                selectionAdorned: true,
                layerName: "Foreground",
                reshapable: true,
                routing: go.Link.AvoidsNodes,
                corner: 5,
                curve: go.Link.JumpOver
              },
              make(go.Shape,  // the link shape
                { stroke: "#303B45", strokeWidth: 2.5 }),
              make(go.TextBlock,  // the "from" label
                {
                  textAlign: "center",
                  font: "bold 14px sans-serif",
                  stroke: "#1967B3",
                  segmentIndex: 0,
                  segmentOffset: new go.Point(NaN, NaN),
                  segmentOrientation: go.Link.OrientUpright
                },
                new go.Binding("text", "text")),
              make(go.TextBlock,  // the "to" label
                {
                  textAlign: "center",
                  font: "bold 14px sans-serif",
                  stroke: "#1967B3",
                  segmentIndex: -1,
                  segmentOffset: new go.Point(NaN, NaN),
                  segmentOrientation: go.Link.OrientUpright
                },
                new go.Binding("text", "toText"))
            );

            // tables in the db are set
            for (var i in $scope.databaseObject.tables) {
              $scope.conceptualTablesList.push($scope.databaseObject.tables[i].table_name);
              nodeDataArray.push({ key: $scope.databaseObject.tables[i].table_name, items: items(i) } );
            }

            // relationships between tables are set
            for (var i in $scope.databaseObject.tables) {
                for(var j in $scope.databaseObject.tables[i].columns){
                    if (typeof $scope.databaseObject.tables[i].columns[j].foreign_keys !== "undefined" ) {
                        for(var k in $scope.databaseObject.tables[i].columns[j].foreign_keys){
                            linkDataArray.push({ from: $scope.databaseObject.tables[i].table_name,
                                                 to: $scope.databaseObject.tables[i].columns[j].foreign_keys[k].table_name});
                        }
                    }
                }
            }
        } else {
          // define the Node template, representing an entity
          var entityTemplate =
            make(go.Node, "Auto",  // the whole node panel
              { selectionAdorned: true,
                resizable: true,
                layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
                fromSpot: go.Spot.AllSides,
                toSpot: go.Spot.AllSides,
                isShadowed: true,
                shadowColor: "#C5C1AA" },
              new go.Binding("location", "location").makeTwoWay(),
              // define the node's outer shape, which will surround the Table
              make(go.Shape,
                { name: "SHAPE",
                  figure: "Rectangle",
                  fill: lightgrad,
                  stroke: "#756875",
                  strokeWidth: 3
                }),
              make(go.Panel, "Table",
                { margin: 4, stretch: go.GraphObject.Fill },
                make(go.RowColumnDefinition, { row: 0, sizing: go.RowColumnDefinition.None }),
                // the table header
                make(go.TextBlock,
                  {
                    row: 0, alignment: go.Spot.Center,
                    margin: new go.Margin(0, 14, 0, 2),  // leave room for Button
                    font: "bold 16px sans-serif"
                  },
                  new go.Binding("text", "key")),
                // the collapse/expand button
                make("PanelExpanderButton", "LIST",  // the name of the element whose visibility this button toggles
                  { row: 0, alignment: go.Spot.TopRight }),
                // the list of Panels, each showing an attribute
                make(go.Panel, "Vertical",
                  {
                    name: "LIST",
                    row: 1,
                    padding: 3,
                    alignment: go.Spot.TopLeft,
                    defaultAlignment: go.Spot.Left,
                    stretch: go.GraphObject.Horizontal,
                    itemTemplate: itemTempl
                  },
                  new go.Binding("itemArray", "items"))
              )  // end Table Panel
            );  // end Node

            var relationshipTemplate =
              make(go.Node, "Auto",  // the whole node panel
                { selectionAdorned: false,
                  resizable: true,
                  layoutConditions: go.Part.LayoutStandard,
                  fromSpot: go.Spot.AllSides,
                  toSpot: go.Spot.AllSides,
                  isShadowed: true,
                  shadowColor: "#C5C1AA" },
                new go.Binding("location", "location").makeTwoWay(),
                // define the node's outer shape, which will surround the Table
                make(go.Shape,
                  { figure: "Diamond",
                    fill: lightgrad,
                    stroke: "#756875",
                    strokeWidth: 3
                  }),
                make(go.Panel, "Table",
                  { margin: 4, stretch: go.GraphObject.Fill },
                  make(go.RowColumnDefinition, { row: 0, sizing: go.RowColumnDefinition.None }),
                  // the table header
                  make(go.TextBlock,
                    {
                      row: 0, alignment: go.Spot.Center,
                      margin: new go.Margin(0, 14, 0, 2),  // leave room for Button
                      font: "bold 16px sans-serif"
                    },
                    new go.Binding("text", "key")),
                  // the collapse/expand button
                  make("PanelExpanderButton", "LIST",  // the name of the element whose visibility this button toggles
                    { row: 0, alignment: go.Spot.TopRight }),
                  // the list of Panels, each showing an attribute
                  make(go.Panel, "Vertical",
                    {
                      name: "LIST",
                      row: 1,
                      padding: 3,
                      alignment: go.Spot.TopLeft,
                      defaultAlignment: go.Spot.Left,
                      // stretch: go.GraphObject.Horizontal,
                      itemTemplate: itemTempl
                    },
                    new go.Binding("itemArray", "items"))
                )  // end Table Panel
              );  // end Node

          // define the Link template, representing a relationship
          myConceptualERDiagram.linkTemplate =
            make(go.Link,  // the whole link panel
              {
                selectionAdorned: true,
                layerName: "Foreground",
                reshapable: true,
                routing: go.Link.AvoidsNodes,
                corner: 5,
                curve: go.Link.JumpOver
              },
              make(go.Shape,  // the link shape
                { stroke: "#303B45", strokeWidth: 2.5 }),
              make(go.TextBlock,  // the "from" label
                {
                  textAlign: "center",
                  font: "bold 14px sans-serif",
                  stroke: "#1967B3",
                  segmentIndex: 0,
                  segmentOffset: new go.Point(NaN, NaN),
                  segmentOrientation: go.Link.OrientUpright
                },
                new go.Binding("text", "text")),
              make(go.TextBlock,  // the "to" label
                {
                  textAlign: "center",
                  font: "bold 14px sans-serif",
                  stroke: "#1967B3",
                  segmentIndex: -1,
                  segmentOffset: new go.Point(NaN, NaN),
                  segmentOrientation: go.Link.OrientUpright
                },
                new go.Binding("text", "toText"))
            );

            var templmap = new go.Map("string", go.Node);
            // for each of the node categories, specify which template to use
            templmap.add("relationship", relationshipTemplate);
            templmap.add("entity", entityTemplate);

            myConceptualERDiagram.nodeTemplateMap = templmap;

            for (var i in abstractRelationships){
                var tableNames = [];
                for (var j in abstractRelationships[i]) {
                  tableNames.push({ name: abstractRelationships[i][j].tableName, iskey: true});
                }
                nodeDataArray.push({ key: "Relationship: " + (+i + +1), items: tableNames, category: "relationship"});
            }

            for (var i in abstractEntities){
                var tableNames = [];

                for (var j in abstractEntities[i]) {
                  tableNames.push({ name: abstractEntities[i][j].tableName, iskey: true});
                }
                $scope.conceptualEntitiesList.push("Entity: " + (+i + +1))
                nodeDataArray.push({ key: "Entity: " + (+i + +1), items: tableNames ,  category: "entity" });

                for (var pk_eid in abstractEntities[i][0].PK) {
                    for (var m in abstractRelationships) {
                        var relation = false;
                        for (var n in abstractRelationships[m]) {
                            for (var pk_rid in abstractRelationships[m][n].PK) {
                                if (abstractEntities[i][0].PK[pk_eid] == abstractRelationships[m][n].PK[pk_rid])
                                {
                                    linkDataArray.push({ from: "Entity: " + (+i + +1),
                                                           to: "Relationship: " + (+m + +1)});
                                    relation = true;
                                    break;
                                }
                            }
                            if (relation)
                            {
                              break;
                            }
                        }
                    }
                }
            }
        }


        // create the model for the E-R diagram

        if (diagramType == 0)
        {
          myERDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
        } else {
          myConceptualERDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
        }
      }



    $scope.showERDiagram = function(b) {
        $scope.ERToggle = b;
    }

    $scope.hideAllAttributes = function() {
        if ($scope.ERToggle) {
            myERDiagram.startTransaction();
            myERDiagram.nodes.each (function(n) {
                var p = n.findObject("LIST");
                if (p !== null) p.visible = false;
            });
            myERDiagram.commitTransaction("collapsed all panels");
            myERDiagram.requestUpdate();
        } else {
            myConceptualERDiagram.startTransaction();
            myConceptualERDiagram.nodes.each (function(n) {
                var p = n.findObject("LIST");
                if (p !== null) p.visible = false;
            });
            myConceptualERDiagram.commitTransaction("collapsed all panels");
        }
    }

    $scope.showAllAttributes = function() {
        if ($scope.ERToggle){
            myERDiagram.startTransaction();
            myERDiagram.nodes.each (function(n) {
                var p = n.findObject("LIST");
                if (p !== null) p.visible = true;
            });
            myERDiagram.commitTransaction("collapsed all panels");
            myERDiagram.requestUpdate();
        } else {
            myConceptualERDiagram.startTransaction();
            myConceptualERDiagram.nodes.each (function(n) {
                var p = n.findObject("LIST");
                if (p !== null) p.visible = true;
            });
            myConceptualERDiagram.commitTransaction("collapsed all panels");
        }

    }

    $scope.initializeForceDirectedLayout = function() {
        if ($scope.ERToggle) {
            if (typeof myERDiagram !== "undefined") {
                myERDiagram.startTransaction("change layout to circular layout");
                myERDiagram.layout = make(go.ForceDirectedLayout);
                myERDiagram.commitTransaction("change layout to circular layout");
            } else {
                initializeER(0);
            }
        }
        else {
            if (typeof myConceptualERDiagram !== "undefined") {
                myConceptualERDiagram.startTransaction("change layout to circular layout");
                myConceptualERDiagram.layout = make(go.ForceDirectedLayout);
                myConceptualERDiagram.commitTransaction("change layout to circular layout");
            } else {
                initializeER(1);
            }
        }
    }

    $scope.initializeCircularLayout = function() {
        if ($scope.ERToggle) {
            if (typeof myERDiagram !== "undefined") {
                myERDiagram.startTransaction("change layout to circular layout");
                myERDiagram.layout = make(go.CircularLayout);
                myERDiagram.commitTransaction("change layout to circular layout");
            } else {
                initializeER(0);
            }
        }
        else {
            if (typeof myConceptualERDiagram !== "undefined") {
                myConceptualERDiagram.startTransaction("change layout to circular layout");
                myConceptualERDiagram.layout = make(go.CircularLayout);
                myConceptualERDiagram.commitTransaction("change layout to circular layout");
            } else {
                initializeER(1);
            }
        }
    }

    $scope.initializeLayeredDigraphLayout = function() {
        if ($scope.ERToggle) {
            if (typeof myERDiagram !== "undefined") {
                myERDiagram.startTransaction("change layout to circular layout");
                myERDiagram.layout = make(go.LayeredDigraphLayout);
                myERDiagram.commitTransaction("change layout to circular layout");
            } else {
                initializeER(0);
            }
        }
        else {
            if (typeof myConceptualERDiagram !== "undefined") {
                myConceptualERDiagram.startTransaction("change layout to circular layout");
                myConceptualERDiagram.layout = make(go.LayeredDigraphLayout);
                myConceptualERDiagram.commitTransaction("change layout to circular layout");
            } else {
                initializeER(1);
            }
        }
    }

    $scope.exportImage = function() {
      var link = document.createElement('a');
      link.download = 'diagram.png';
      if ($scope.ERToggle)
      {
        link.href = myERDiagram.makeImage().src;
      } else {
        link.href = myConceptualERDiagram.makeImage().src;
      }
      link.click();
    }

    /* To get the abstract enties and relations from the databaseOBJ, do something like this */

    var cluster = abstractER($scope.databaseObject);
    var abstractEntities = getAbstractEntities(cluster);
    var abstractRelationships = getAbstractRelationships(cluster);

    /* now we have abstract entities which can be accessed like abstractEntities[i]
     * now we have abstract relationships which can be accessed like abstractRelationships[i] */

    //Initialize Diagrams
    initializeER(0);
    initializeER(1);
}]);
