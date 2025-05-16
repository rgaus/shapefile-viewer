# Shapefile Viewer

<p float="left">
  <img src="/readme2.png" width="49%" />
  <img src="/readme1.png" width="49%" />
</p>

## Overview
This is the beginnings of a web application that a user could use to render shapefiles. Right now,
it's purely client side - a user uploads a shapefile `*.zip`, the application parses it with
[shapefile.js](https://github.com/matthewdowns/shapefile.js), and it is rendered on top of a themed
[leaflet](http://leafletjs.com/) map.

When I started this project, I made a list of everything I wanted to accomplish and started working
through that list, trying to get through the more important features first so that application would
be usable.

For context, I spent about 3 hours writing the code for the project spread across a few days, and
about half an hour writing up this documentation.

## Development
If you'd like to run the application locally:
Prerequisites: ensure node.js and npm are installed (I built this with node `v22.3.0`)

1. Clone this github repository onto your system
2. Install dependencies with `npm install`
3. Run the application with `npm run dev`. If nothing is running on port 3000, the application will
   be available at http://localhost:3000. If something is running on that port, then next.js will
   select a different port - look at the dev server logs to see which one.

## Challenges
Overall, I'm pretty happy with the results of this project, and it went pretty smoothly. There were
a few unexpected challenges though I wanted to call out:

### `react-leaflet` ended up being a bit of a dead end
Initially, I chose react-leaflet for rendering the map - especially small to medium inputs, a tool
like this means as an engineer I can move a lot faster and more easily dynamically update the map.
However, I had a really difficult time getting the map to render - for some reason, only half of the
tiles on the map would load, leaving the map a mix of black squares and fully filled map tiles.

If this were a real product, I'd spend some time digging into this, but since I was on a timeline I
ended up switching over to an imperatively rendered leaflet map. Currently, I'm completely tearing
down and reinitializing the map whenever any data on the map changes, and that's obviously not
ideal. To implement some of the more advanced future ideas I mentioned below (in particular, the
hover behavior), I'd have to make some significant changes to how this works - either dynamically
add/modify/remove entities on the map through a d3 data join like process, or I'd need to get
something like react-leaflet working.

### Coordinate projection
Once I was able to render the map, I was pretty quickly able to parse a shapefile and get some data
I could render. However, at least in my test shapefile (which I found online), the coordinate data
contained inside didn't look like latitude and longitude - x and y were in the millions. After some
digging around online, it looked like these were in a coordinate system called
[utm](https://gisgeography.com/easting-northing-coordinates/) and the x and y values within were in
units of `eastings` and `northings`.

I ended up burning a solid hour just trying to convert these values into latitudes and longitudes I
could plot. I tried a series of libraries but at the end of the day ended up coming up with
a solution using [proj4js](https://github.com/proj4js/proj4js) - I parsed the corresponding
`xxx.prj` file for the `xxx.shp` file in the zip, fed this into `proj4` converting to `WGS84`, and
stored the resulting latitudes and longtudes into the application state.

### Map centering
After getting the shapefile parsing logic wired up, I uploaded a shapefile, and... I couldn't see it
on the map. Panning around a bit, I noticed that it was on the other side of the world! This was
obviously a poor user experience - what somebody would expect in this case is that after uploading a
file, the map's location would change to be centered on the shapefile geometry.

For geojson like arethemtic operations like this, I've found [turf.js](https://turfjs.org/) to be
excellent. So, I ended up computing a center point for each subfile, and then combining all these
centers together to get a center point for the whole shapefile, and passed that into the `center`
parameter when constructing the leaflet map. I didn't have time, but ideally, the leaflet map's zoom
level would also be updated so that the bounding box of the shapefile was contained within the map
viewport.

### Polygon? Multipolygon?
Right about at time, I realized I should probably test this application with another shapefile just
to make sure what I wrote generalized. I found a different shapefile (`shapefile/USA_adm.zip`),
which when uploaded, largely worked as expected! However, there were some interesting overlapping
polygons that I couldn't explain - it seemed sort of like I was rendering all the subgeometries
within a multipolygon as individual polygons rather than the entire multipolygon as one entity. I
didn't have the time to dig into this but obviously this might be a big problem for more complex
shapefiles.

## Future Improvements
As I was building this application, I focused on getting something that worked ASAP. With more time,
here's a list in no particular order of what I'd focus on depending on the business requirements at
play:

### Switch to `react-leaflet` or similar
I mentioned this above so I won't go into depth on the context around this here, but many of the
ideas I had below are gated on the map rendering being done quite naively at the moment.

### Webworker for parsing, or move this to a backend system
I noticed when calling shapefile.js's parse function that it ran synchronously for many seconds,
blocking the main thread. This is obviously not ideal, especially with larger or more complex
shapefiles. In order to make this scale more effectively, I'd offload the parsing logic to a
webworker.

Or, if the infrastructure was available serverside, I'd potentially consider doing this
on the backend:
1. Upload the shapefile to object storage
2. Make a request to a server, specifying the uploaded shapefile
3. When handling that request, the server puts a message in a queue / kafka topic / etc
4. Another system reads from that queue, does the processing, and sends websocket pushes to the
   client providing status updates if required
5. Once done, the job stores the results in a database of some sort that the client can query
   through the server system

The big pro of doing this type of processing serverside is if it is computationally expensive, the
servers can be scaled independently of the user's local system, including potentially adding
resources like GPUs to the machines if that would be helpful. The big con of this approach is it is
quite a bit more complicated, and since it's a distributed system, new types of problems start to
arise that could be hard to debug. Doing this serverside is definitely not where I'd start but it's
something to keep in mind as the application grows.

### Additional sidebar behavior
Right now, I'm showing a list of subfiles within the application's sidebar. As a user, it seems like
this is pretty important data, since from what I can tell these shapefiles can get relatively large,
and without a list like this, it could become difficult to understand what's contained within the dataset.

However, I think there's a lot more that can be done here. I think a pretty small lift that would
make a massive difference would be to color code each subfile differently, showing the color on the
sidebar as well as changing the color of the shape within the leaflet map. I'd also add the ability
to show and hide subfiles, maybe by adding a checkbox in front of each row, so a user can hide data
that isn't important to their use case.

In addition, I've had a lot of success in visual applications like this in the past adding hover
behavior to help link sidebar items with their corresponding shapes in the map. For example - a user
could hover over a sidebar item, and the sidebar item could darken and the corresponding shape on
the map could change color to match that darker color. Also, doing this in reverse is super useful
too - so hovering over the shape on the map results in the same behavior. This makes the interface
super discoverable - through these color changes, it is possible for somebody to quickly get a sense
of what subfile is located where on the map.

Finally, some filtering / sorting / searching type behavior could be helpful on the sidebar as well,
again to help the user scope down the data they are looking at only to what is important for their
particular use case.

Most of these sidebar features which involve changing map state dynamically would require porting
the application to something like `react-leaflet` as mentioned above.

### Add support for more geometry types
My test shapefile only contained polygons, but I think it would be pretty easy to add support for
other geometry types with more time. Right now, non polygons are just omitted on the map view.

### Broader backend support
Right now, this application is client only - that's what the requirements were, after all. However,
I think if this application were to be used at any real scale with shapefiles of any real sufficient
complexity, exploring some sort of backend storage could be valuable. If one could upload a
shapefile and store the parsed results in a database, the user wouldn't have to reparse the
shapefile every time they reloaded the application. Also, a database opens up lots of new
possibilities - maybe they could annotate a shapefile with notes? Maybe shapefiles could be shared
as a link to another user? Maybe users could make modifications to shapefiles and re-export them
back out of the system again? Obviously I'm just speculating here, but all these seem like quite
reasonable things to build if were to address some user pain.

## General Infrastructure
- Some sort of code formatting, like `prettier`: On a team, these tools can be helpful to normalize
  everyone's code into a unified format for the sake of consistency. I care very little what set of
  rules are used but on a team above a certain size, it is pretty important tool. If this
  application were going to live for a long duration, I'd add a tool like this to the project.

- Some sort of linting, like `eslint`: Again, a similar rationale - on a team, these tools can be
  helpful to make sure everyone is doing things that are consistent and easy to understand for the
  next person.

- Continuous integration / deployment: Something like github actions running when every commit is
  pushed and running the above linting and formatting check steps can be nice to have, and IMO on a
  team above a certain size, is essential. In addition, running some sort of type checking step
  would be a really good idea to do in here.

### General refactoring
I spent most of my ~3 hours fixing actual functionality, but there's a lot that could be done to
actually break down the code into smaller chunks and set the project up for success to scale
effectively as new business requirements come down the line. Mostly what I'm referring to here are
breaking up large components into smaller more self contained ones, figuring out where certain bits
of functionality can be reused, etc. This is ongoing and should always happen in the background.
