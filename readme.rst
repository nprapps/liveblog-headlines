liveblog-headlines
======================================================

A feed widget fed from the RSS from NPR.org or one of our `liveblogs <https://github.com/nprapps/liveblog-standalone/>`_.

This news app is built on our `interactive template <https://github.com/nprapps/interactive-template>`_. Check the readme for that template for more details about the structure and mechanics of the app, as well as how to start your own project.

Getting started
---------------

To run this project you will need:

* Node installed (preferably with NVM or another version manager)
* The Grunt CLI (install globally with ``npm i -g grunt-cli``)
* Git

With those installed, you can then set the project up using your terminal:

#. Pull the code - ``git clone git@github.com:nprapps/liveblog-headlines``
#. Enter the project folder - ``cd liveblog-headlines``
#. Install dependencies from NPM - ``npm install``
#. Start the server - ``grunt``

Key URL parameters
------------------

This headlines widget looks for several URL parameters (ideally urlencoded), in this order:

* ``feed`` - URL for a standard blog RSS feed
* ``link`` - URL for the blog landing page (populates the "MORE" link at the top of the widget)
* ``headline`` - Title that displays at the top of the widget, above the headlines (usually the title of the blog)
* ``limit`` - The maximum number of headlines shown (optional; the default is 6. to show all available headlines, use ``limit=all``)
* ``timestamps`` - Boolean to turn timestamps on or off (optional; the default is `true`)
* ``pjax`` - Boolean to load links via pjax when this embed lives on an NPR.org page (optional; the default is `true`)

Sample embed code
-----------------

``<p data-pym-loader data-child-src="https://apps.npr.org/liveblog-headlines/?feed=https://www.npr.org/live-updates/student-loan-forgiveness-how-to-apply.rss&link=https://www.npr.org/live-updates/student-loan-forgiveness-how-to-apply&headline=Live%20Updates:%20Student%20Loan%20Forgiveness" id="responsive-embed-hhm-headlines"> Loading... </p> <script src="https://pym.nprapps.org/npr-pym-loader.v2.min.js"></script>``

Running tasks
-------------

Like all interactive-template projects, this application uses the Grunt task runner to handle various build steps and deployment processes. To see all tasks available, run ``grunt --help``. ``grunt`` by itself will run the "default" task, which processes data and starts the development server. However, you can also specify a list of steps as arguments to Grunt, and it will run those in sequence. For example, you can just update the JavaScript and CSS assets in the build folder by using ``grunt bundle less``.

Common tasks that you may want to run include:

* ``sheets`` - updates local data from Google Sheets
* ``docs`` - updates local data from Google Docs
* ``google-auth`` - authenticates your account against Google for private files
* ``static`` - rebuilds files but doesn't start the dev server
* ``cron`` - runs builds and deploys on a timer (see ``tasks/cron.js`` for details)
* ``publish`` - uploads files to the staging S3 bucket

  * ``publish:live`` uploads to production
  * ``publish:simulated`` does a dry run of uploaded files and their compressed sizes

Troubleshooting
---------------

**Fatal error: Port 35729 is already in use by another process.**

The live reload port is shared between this and other applications. If you're running another interactive-template project or Dailygraphics Next, they may collide. If that's the case, use ``--reload-port=XXXXX`` to set a different port for the live reload server. You can also specify a port for the webserver with ``--port=XXXX``, although the app will automatically find the first available port after 8000 for you.
