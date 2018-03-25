    // https://github.com/guest271314/GraphInterest 3-11-2018
    // https://math.stackexchange.com/q/2528122
    async function* graphInterest({
        principal = 0, // initial principal
        rate = 0, // rate as decimal
        time = 0, // time as years
        n = 360, // periods per year to compound interest
        continuous = false
    } = {}) {
      if (!time || !principal) {
        return new ReferenceError(`time needs to be defined`);
      };
      // banker's year constant, WeakMap of Set having values `{principal, day, days, year}` having `.length` `n` per `time`
      const [N, P] = [360, new WeakMap];
      // while (true) {
      for (let t = 0, day = 0, days = 0, year = t + 1, add; t < time; t++, year++) {
        const key = {
          year
        };
        const current = new WeakMap([
          [key, new Set]
        ]);
        P.set(current, current.get(key));
        let addition = yield {
          year, day, days, principal
        };
        // `p` number of `n` periods per year to compound `principal`
        for (let p = 0; p < n; p++) {
          day = (N / n) * (p + 1);
          days += N / n;
          principal *= (continuous ? Math.exp(rate * (p / n)) : 1 + (rate / n));
          if (addition || add) {
            principal += add || addition;
            add = add || addition;
            addition = add;
            console.log("addition:", addition);
          }
          P.get(current).add({
            year, day, days, principal
          });
          let next = [...P.get(current)][P.get(current).size - 1];
          let deposit = yield next;
          if (deposit && typeof deposit === "number") {
            console.log("add:", deposit);
            principal += deposit;
            next.principal = principal;
            P.get(current).add(next);
          }
        }
        // set initial `principal` for next `time` : year
        ;({principal} = [...P.get(current)][P.get(current).size - 1]);
      }
      // }
    };
    let accruedInterest = graphInterest({
      principal: 1,
      rate: 0.03,
      time: 1,
      n: 12
    });
    (async() => {
      const pool = new Map;
      pool.set(pool.size, await Promise.all([2.5, 2.5, 2.5, 1, 1, .5]));
      await accruedInterest.next().then(({
        value,
        done
      }) => {
        console.log(value, done)
      });
      await accruedInterest.next(pool.get(pool.size - 1).reduce((a, b) => a + b, 0)).then(({
        value,
        done
      }) => {
        console.log(value, done)
      });
      await accruedInterest.next().then(({
        value,
        done
      }) => {
        console.log(value, done)
      });
      /*
      pool.set(pool.size, await Promise.all([5.0, 12.5, 0, 2.5]));
      await accruedInterest.next(pool.get(pool.size - 1).reduce((a, b) => a + b, 0)).then(({
        value, done
      }) => {
        console.log(value, done)
      });
      */
      for await (const prop of accruedInterest) {
        console.log(prop)
      }
    })();
