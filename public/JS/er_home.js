 // globaal variable 
 
 var JSONObj = 
 { 
    "tables": [ 
  {
  "table_name": "houses",
  "columns": [
    {
    "column_name": "id", 
      "foreign_keys": [
      {
      "table_name": "animals",
      "column_name": "car_id"
      },
      {
      "table_name": "Suppliers",
      "column_name": "car_id"
      }]
    },
  {
    "column_name": "name"
  }
  ]
  },

  {
  "table_name": "animals",
  "columns": [
    {
    "column_name": "dog"
    },
  {
    "column_name": "cat",
    "foreign_keys": [
      {
      "table_name": "people",
      "column_name": "car_id"
      }
      ]
  }
  ]
  },


  {
  "table_name": "people",
  "columns": [
    {
    "column_name": "height"
    },
  {
    "column_name": "age"
  },
  {
    "column_name": "weight"
  },
  {
    "column_name": "gender"
  },
  ]
  }
  ]
}




window.onload = function() {
 init(0);
};


// go.js functions 

function init(number) {
    if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
    var make = go.GraphObject.make;  // for conciseness in defining templates
    //$('myDiagramDiv').html('');

    if(number == 0) {
    	 myDiagram =
      make(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
        {
          initialContentAlignment: go.Spot.Center,
          allowDelete: false,
          allowCopy: false,
          layout: make(go.ForceDirectedLayout),
          "undoManager.isEnabled": true
        });
    }


    if(number == 1) {
    	 myDiagram =
      make(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
        {
          initialContentAlignment: go.Spot.Center,
          allowDelete: false,
          allowCopy: false,
          layout: make(go.CircularLayout),
          "undoManager.isEnabled": true
        });
    }


	if(number == 2) {
    	 myDiagram =
      make(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
        {
          initialContentAlignment: go.Spot.Center,
          allowDelete: false,
          allowCopy: false,
          layout: make(go.LayeredDigraphLayout),
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

    // define the Node template, representing an entity
    myDiagram.nodeTemplate =
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
    myDiagram.linkTemplate =
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

    // create the model for the E-R diagram
    var nodeDataArray = [];

     // tables in the db are set 
     for (i = 0; i < JSONObj.tables.length; i++) {
        nodeDataArray.push({ key: JSONObj.tables[i].table_name, items: items(i) } )
      }


    // relationships between tables are set
    var linkDataArray = [];

    linkDataArray.push({ from: "Products", to: "Suppliers" });


  for (i = 0; i < JSONObj.tables.length; i++) {
        for(j = 0; j < JSONObj.tables[i].columns.length; j++ ){
           if (typeof JSONObj.tables[i].columns[j].foreign_keys !== "undefined" ) {
            for(k = 0; k < JSONObj.tables[i].columns[j].foreign_keys.length; k++){
           linkDataArray.push({ from: JSONObj.tables[i].table_name, to: JSONObj.tables[i].columns[j].foreign_keys[k].table_name});
         }
        }
      }
    } 


    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
    //document.write(JSONObj.tables[0].table_name);  

  }




// used to fill attributes of er diagram 
function items(i){
  attributes_array = [];
  
  for (j = 0; j < JSONObj.tables[i].columns.length; j++) {
    attributes_array.push({ name: JSONObj.tables[i].columns[j].column_name, iskey: true});        
      }

  return attributes_array;   
}




  function init_force_directed_layout(){
  	myDiagram.div = null;
   init(0);
  }


  function init_circular_layout(){
  	myDiagram.div = null;
   init(1);
  }

  function init_layered_digraph_layout(){
  	myDiagram.div = null;
   init(2);
  }

  function exportImage() {
    var link = document.createElement('a');
    link.download = 'diagram.png';
    link.href = myDiagram.makeImage().src;
    link.click();
}






