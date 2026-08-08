<template>
  <article class="about">
    <h1>About moshi</h1>
    <section>
      <h2>Project Overview</h2>
      <p>
        moshi is a self-hosted startpage for keeping your running applications and
        services organised. The aim of moshi is to provide an easy-to-deploy,
        highly customizable and functional dashboard, in order to improve productivity
        and enable easy organisation of running services or web links.
      </p>
    </section>

    <section>
      <h2>Reporting a Bug</h2>
      <p>
        If you've come across a bug, please check the browser console for errors
        and report the issue so that it can be fixed.
      </p>
    </section>

    <section>
      <h2>Getting Support</h2>
      <p>
        If you need any help deploying, using, or developing moshi, feel free to
        open an issue on the project repository.
      </p>
    </section>

    <section class="license">
      <h2>License</h2>
      <code>
        Permission is hereby granted, free of charge, to any person obtaining a copy of this
        software and associated documentation files (the "Software"), to deal in the Software
        without restriction, including without limitation the rights to use, copy, modify, merge,
        publish, distribute, sublicense, and/or sell copies of the Software, and to permit
        persons to whom the Software is furnished to do so, subject to the following conditions:
      </code>
      <br><br>
      <code>
        The above copyright notice and this permission notice shall be included in all copies or
        substantial portions of the Software.
      </code>
      <br><br>
      <code>
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
        INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
        PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
        LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
        TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
        OR OTHER DEALINGS IN THE SOFTWARE.
      </code>
    </section>
  </article>
</template>

<script lang="ts">
document.getElementsByTagName('html')[0].setAttribute('data-theme', 'callisto');
export default {};
</script>

<style scoped lang="scss">

article.about {
  background: var(--about-page-background);
  color: var(--about-page-color);
  width: 80%;
  max-width: 1000px;
  margin: 1rem auto 2.5rem auto;
  padding: 1rem;
  border: 1px solid var(--about-page-accent);
  border-radius: var(--curve-factor);
  h1, h2, h3, p, span, div, section {
    color: var(--about-page-color);
  }
  h1 {
    font-size: 2rem;
    text-align: center;
  }
  a, code {
    color: var(--about-page-accent);
  }
  section {
    padding-bottom: 1rem;
    &:not(:last-child) {
      border-bottom: 1px dashed var(--about-page-accent);
    }
  }
  p {
    line-height: 1.5rem;
    font-size: 1rem;
  }
  section.license code {
    color: var(--about-page-color);
  }
}

</style>
